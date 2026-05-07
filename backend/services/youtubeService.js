const { google } = require('googleapis');

const DEFAULT_MAX_RESULTS = 4;
const MAX_RESULTS_LIMIT = 10;
const YOUTUBE_RATE_LIMIT_MS = 200;

let lastRequestAt = 0;

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureRateLimitDelay = async () => {
  const now = Date.now();
  const elapsed = now - lastRequestAt;
  if (elapsed < YOUTUBE_RATE_LIMIT_MS) {
    await sleep(YOUTUBE_RATE_LIMIT_MS - elapsed);
  }
  lastRequestAt = Date.now();
};

const buildVideoUrl = (videoId) => (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '');

const pickThumbnail = (thumbnails = {}) => (
  thumbnails.high?.url ||
  thumbnails.medium?.url ||
  thumbnails.default?.url ||
  ''
);

const parseIso8601DurationSeconds = (iso) => {
  // e.g. PT1H2M3S
  const text = String(iso || '');
  const match = text.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
};

const formatDurationLabel = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${Math.max(1, m)}m`;
};

const mapYoutubeItemToResource = (item, query, detailsById) => {
  const videoId = item.id?.videoId;
  const details = videoId ? detailsById?.get(videoId) : null;

  const durationSeconds = parseIso8601DurationSeconds(details?.contentDetails?.duration);
  const viewCount = details?.statistics?.viewCount ? Number(details.statistics.viewCount) : null;
  const likeCount = details?.statistics?.likeCount ? Number(details.statistics.likeCount) : null;

  return ({
    title: item.snippet?.title || 'Untitled Video',
    url: buildVideoUrl(videoId),
    thumbnail: pickThumbnail(item.snippet?.thumbnails),
    channelName: item.snippet?.channelTitle || 'Unknown Channel',
    publishedDate: item.snippet?.publishedAt || null,
    type: 'video',
    platform: 'YouTube',
    duration: formatDurationLabel(durationSeconds),
    durationSeconds: durationSeconds || null,
    viewCount,
    likeCount,
    rating: null,
    ratingCount: null,
    sourceQuery: query,
  });
};

const searchYouTubeVideos = async ({ query, maxResults = DEFAULT_MAX_RESULTS }) => {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY is not configured');
  }

  const safeQuery = String(query || '').trim();
  if (!safeQuery) return [];

  const cappedMaxResults = Math.min(Math.max(maxResults, 1), MAX_RESULTS_LIMIT);

  await ensureRateLimitDelay();

  const response = await youtube.search.list({
    part: ['snippet'],
    q: safeQuery,
    type: ['video'],
    maxResults: cappedMaxResults,
    order: 'relevance',
    safeSearch: 'moderate',
    videoEmbeddable: 'true',
    relevanceLanguage: 'en',
  });

  const items = response.data?.items || [];
  const videoIds = items
    .map((item) => item.id?.videoId)
    .filter(Boolean);

  let detailsById = new Map();
  if (videoIds.length > 0) {
    await ensureRateLimitDelay();
    const detailsResponse = await youtube.videos.list({
      part: ['contentDetails', 'statistics'],
      id: videoIds,
      maxResults: Math.min(videoIds.length, MAX_RESULTS_LIMIT),
    });
    const detailsItems = detailsResponse.data?.items || [];
    detailsById = new Map(detailsItems.map((d) => [d.id, d]));
  }

  return items
    .map((item) => mapYoutubeItemToResource(item, safeQuery, detailsById))
    .filter((item) => Boolean(item.url));
};

module.exports = { searchYouTubeVideos };
