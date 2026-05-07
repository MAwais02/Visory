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

const mapYoutubeItemToResource = (item, query) => ({
  title: item.snippet?.title || 'Untitled Video',
  url: buildVideoUrl(item.id?.videoId),
  thumbnail: pickThumbnail(item.snippet?.thumbnails),
  channelName: item.snippet?.channelTitle || 'Unknown Channel',
  publishedDate: item.snippet?.publishedAt || null,
  type: 'video',
  platform: 'YouTube',
  duration: '',
  rating: null,
  sourceQuery: query,
});

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
  return items
    .map((item) => mapYoutubeItemToResource(item, safeQuery))
    .filter((item) => Boolean(item.url));
};

module.exports = { searchYouTubeVideos };
