const { searchYouTubeVideos } = require('./youtubeService');

const DEFAULT_RESOURCES_LIMIT = 3;
const YOUTUBE_RESULTS_LIMIT = 1;
const YOUTUBE_FETCH_PER_QUERY = 4;

const dedupeByUrl = (resources) => {
  const seen = new Set();
  return resources.filter((resource) => {
    if (!resource?.url || seen.has(resource.url)) return false;
    seen.add(resource.url);
    return true;
  });
};

const fetchFromYouTube = async (queries, maxResultsPerQuery) => {
  const allResults = [];

  for (const query of queries) {
    try {
      const videos = await searchYouTubeVideos({ query, maxResults: maxResultsPerQuery });
      allResults.push(...videos);
    } catch (error) {
      console.error(`[resourceService] YouTube lookup failed for query "${query}":`, error.message);
    }
  }

  return allResults;
};

const toKeywordSet = (text) => {
  const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'into', 'that', 'this', 'what', 'your']);
  return new Set(
    String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
  );
};

const scoreVideoMatch = (video, topicKeywords, subtopicKeywords) => {
  const haystack = `${video.title || ''} ${video.channelName || ''} ${video.sourceQuery || ''}`.toLowerCase();

  let score = 0;
  for (const word of topicKeywords) {
    if (haystack.includes(word)) score += 2;
  }
  for (const word of subtopicKeywords) {
    if (haystack.includes(word)) score += 4;
  }

  if (haystack.includes('tutorial')) score += 2;
  if (haystack.includes('beginner')) score += 1;
  if (haystack.includes('explained')) score += 1;

  return score;
};

const pickBestMatchedVideos = (videos, { topicTitle, subtopicTitle, limit }) => {
  const topicKeywords = toKeywordSet(topicTitle);
  const subtopicKeywords = toKeywordSet(subtopicTitle);

  return [...videos]
    .sort((a, b) => (
      scoreVideoMatch(b, topicKeywords, subtopicKeywords) -
      scoreVideoMatch(a, topicKeywords, subtopicKeywords)
    ))
    .slice(0, limit);
};

const getFallbackVideoCandidates = async ({ topicTitle, subtopicTitle }) => {
  const fallbackQueries = [
    `${subtopicTitle} tutorial`,
    `${topicTitle} ${subtopicTitle} tutorial`,
    `${subtopicTitle} explained`,
  ]
    .map((query) => String(query || '').trim())
    .filter(Boolean);

  return fetchFromYouTube(fallbackQueries, YOUTUBE_FETCH_PER_QUERY);
};

const buildFocusedQueries = ({ topicTitle, subtopicTitle, aiQueries }) => {
  const focused = [
    `${topicTitle} ${subtopicTitle} tutorial`.trim(),
    `${subtopicTitle} ${topicTitle} explained for beginners`.trim(),
  ];

  return [...new Set([...focused, ...aiQueries])].filter(Boolean);
};

const buildCourseSearchLinks = (query) => {
  const encodedQuery = encodeURIComponent(query);
  return [
    {
      title: `Udemy courses for ${query}`,
      url: `https://www.udemy.com/courses/search/?q=${encodedQuery}`,
      thumbnail: '',
      channelName: 'Udemy',
      publishedDate: null,
      type: 'course',
      platform: 'Udemy',
      duration: '',
      rating: null,
      sourceQuery: query,
    },
    {
      title: `Coursera courses for ${query}`,
      url: `https://www.coursera.org/search?query=${encodedQuery}`,
      thumbnail: '',
      channelName: 'Coursera',
      publishedDate: null,
      type: 'course',
      platform: 'Coursera',
      duration: '',
      rating: null,
      sourceQuery: query,
    },
  ];
};

const generateResourcesFromQueries = async ({
  queryPlan,
  maxResources = DEFAULT_RESOURCES_LIMIT,
  topicTitle = '',
  subtopicTitle = '',
}) => {
  const aiQueries = Array.isArray(queryPlan?.queries)
    ? queryPlan.queries
        .map((item) => String(item?.query || '').trim())
        .filter(Boolean)
    : [];
  const queries = buildFocusedQueries({ topicTitle, subtopicTitle, aiQueries });

  if (queries.length === 0) {
    return {
      resources: [],
      sources: { youtube: { status: 'skipped', reason: 'no_queries' } },
    };
  }

  const youtubeResults = await fetchFromYouTube(queries, YOUTUBE_FETCH_PER_QUERY);
  const dedupedYouTube = dedupeByUrl(youtubeResults);
  let rankedVideos = pickBestMatchedVideos(dedupedYouTube, {
    topicTitle,
    subtopicTitle,
    limit: YOUTUBE_RESULTS_LIMIT,
  });
  if (rankedVideos.length === 0) {
    const fallbackVideos = dedupeByUrl(await getFallbackVideoCandidates({ topicTitle, subtopicTitle }));
    rankedVideos = pickBestMatchedVideos(fallbackVideos, {
      topicTitle,
      subtopicTitle,
      limit: YOUTUBE_RESULTS_LIMIT,
    });
  }

  const primaryQuery = `${topicTitle} ${subtopicTitle}`.trim() || queries[0];
  const courseLinks = primaryQuery ? buildCourseSearchLinks(primaryQuery) : [];

  // Priority order: 1 matched YouTube + Udemy/Coursera links.
  const combinedResources = dedupeByUrl([
    ...rankedVideos.slice(0, 1),
    ...courseLinks,
  ]).slice(0, maxResources);

  return {
    resources: combinedResources,
    sources: {
      youtube: {
        status: 'ok',
        queryCount: queries.length,
        resultCount: rankedVideos.length,
      },
      coursera: { status: primaryQuery ? 'search_link' : 'not_configured' },
      udemy: { status: primaryQuery ? 'search_link' : 'not_configured' },
      medium: { status: 'not_configured' },
    },
  };
};

module.exports = { generateResourcesFromQueries };
