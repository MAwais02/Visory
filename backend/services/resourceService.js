const { searchYouTubeVideos } = require('./youtubeService');
const { RESOURCE_EFFECTIVENESS_MATRIX, scoreResourceWithMatrix } = require('../utils/resourceEffectiveness');

const DEFAULT_RESOURCES_LIMIT = 3;
const YOUTUBE_RESULTS_LIMIT = 2;
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

const countKeywordHits = (haystack, keywords) => {
  let hits = 0;
  for (const word of keywords) {
    if (haystack.includes(word)) hits += 1;
  }
  return hits;
};

const pickBestMatchedVideos = (videos, { topicTitle, subtopicTitle, limit, expectedMinutes }) => {
  const topicKeywords = toKeywordSet(topicTitle);
  const subtopicKeywords = toKeywordSet(subtopicTitle);

  const scored = videos.map((video) => {
    const haystack = `${video.title || ''} ${video.channelName || ''} ${video.sourceQuery || ''}`.toLowerCase();
    const topicHits = countKeywordHits(haystack, topicKeywords);
    const subtopicHits = countKeywordHits(haystack, subtopicKeywords);
    const matrixScore = scoreResourceWithMatrix({ resource: video, topicTitle, subtopicTitle, expectedMinutes });

    return {
      video,
      topicHits,
      subtopicHits,
      matrixScore,
    };
  });

  // Relevance guardrail: ensure the selected resource is actually about the subtopic.
  // This prevents "SQL vs NoSQL" from winning when searching for "latency/throughput/availability/consistency".
  const filtered = scored.filter((entry) => (
    entry.subtopicHits >= 1 || (entry.topicHits >= 2) || entry.matrixScore.matrix.relevance >= 14
  ));

  const ranked = (filtered.length ? filtered : scored)
    .sort((a, b) => (
      b.matrixScore.effectivenessScore - a.matrixScore.effectivenessScore
    ))
    .slice(0, limit)
    .map((entry) => entry.video);

  return ranked;
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
  expectedMinutes = null,
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
  const durationFilteredYouTube = dedupedYouTube.filter((video) => {
    // Hard constraint: pick only 3–10 minute videos (FYP requirement)
    if (String(video?.platform || '') !== 'YouTube') return true;
    const seconds = Number(video?.durationSeconds);
    if (!Number.isFinite(seconds) || seconds <= 0) return false; // unknown duration => exclude
    return seconds >= 180 && seconds <= 600;
  });
  let rankedVideos = pickBestMatchedVideos(dedupedYouTube, {
    topicTitle,
    subtopicTitle,
    limit: YOUTUBE_RESULTS_LIMIT,
    expectedMinutes,
  });
  if (rankedVideos.length === 0 && durationFilteredYouTube.length > 0) {
    rankedVideos = pickBestMatchedVideos(durationFilteredYouTube, {
      topicTitle,
      subtopicTitle,
      limit: YOUTUBE_RESULTS_LIMIT,
      expectedMinutes,
    });
  }
  if (rankedVideos.length === 0) {
    const fallbackVideos = dedupeByUrl(await getFallbackVideoCandidates({ topicTitle, subtopicTitle }));
    const durationFilteredFallback = fallbackVideos.filter((video) => {
      if (String(video?.platform || '') !== 'YouTube') return true;
      const seconds = Number(video?.durationSeconds);
      if (!Number.isFinite(seconds) || seconds <= 0) return false;
      return seconds >= 180 && seconds <= 600;
    });
    rankedVideos = pickBestMatchedVideos(durationFilteredFallback.length ? durationFilteredFallback : fallbackVideos, {
      topicTitle,
      subtopicTitle,
      limit: YOUTUBE_RESULTS_LIMIT,
      expectedMinutes,
    });
  }

  const primaryQuery = `${topicTitle} ${subtopicTitle}`.trim() || queries[0];
  const courseLinks = primaryQuery ? buildCourseSearchLinks(primaryQuery) : [];

  // Priority order: 1 matched YouTube + Udemy/Coursera links.
  const combinedResources = dedupeByUrl([
    ...rankedVideos.slice(0, 1),
    ...courseLinks,
  ]).slice(0, maxResources);

  // FYP: verify/score fetched resources using a defined matrix
  const verifiedResources = combinedResources.map((resource) => {
    const scored = scoreResourceWithMatrix({ resource, topicTitle, subtopicTitle, expectedMinutes });
    return {
      ...resource,
      verification: {
        matrixName: RESOURCE_EFFECTIVENESS_MATRIX.name,
        effectivenessScore: scored.effectivenessScore,
        breakdown: scored.matrix,
        notes: scored.verificationNotes,
        verifiedAt: new Date(),
      },
    };
  });

  return {
    resources: verifiedResources,
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
