/**
 * Resource Effectiveness / Verification Matrix (FYP)
 * -------------------------------------------------
 * This matrix scores the QUALITY of fetched resources at retrieval time.
 * It does not depend on user behavior.
 *
 * Score range: 0..100
 *
 * Dimensions (weights):
 * - relevance (0..35): keyword match to topic/subtopic + intent cues
 * - sourceReliability (0..20): platform-based trust heuristics
 * - freshness (0..10): published date recency (when available)
 * - engagementSignals (0..15): views/likes/ratings when available
 * - durationFit (0..10): duration appropriateness vs expected study time
 * - contentSignals (0..10): tutorial/explained cues, reasonable title length, non-spam patterns
 */

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const toKeywordSet = (text) => {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'from', 'into', 'that', 'this', 'what', 'your', 'you', 'are', 'how', 'why',
  ]);

  return new Set(
    String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  );
};

const scoreKeywordOverlap = (haystack, keywords, weightPerHit) => {
  let score = 0;
  for (const word of keywords) {
    if (haystack.includes(word)) score += weightPerHit;
  }
  return score;
};

const getPlatformReliabilityScore = (platform) => {
  const p = String(platform || '').toLowerCase();

  // Heuristic: YouTube is variable quality; Coursera/Udemy are curated but can be generic search links.
  if (p === 'coursera') return 16;
  if (p === 'udemy') return 15;
  if (p === 'youtube') return 12;
  if (p === 'github') return 13;
  if (p === 'medium') return 11;
  return 9;
};

const getFreshnessScore = (publishedDate) => {
  if (!publishedDate) return 5; // unknown = neutral
  const d = new Date(publishedDate);
  if (Number.isNaN(d.getTime())) return 5;

  const ageDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays < 180) return 10;
  if (ageDays < 365) return 8;
  if (ageDays < 365 * 2) return 6;
  if (ageDays < 365 * 4) return 4;
  return 2;
};

const getContentSignalsScore = (title) => {
  const t = String(title || '').toLowerCase();
  let score = 5;

  // Positive cues
  if (t.includes('tutorial')) score += 4;
  if (t.includes('explained')) score += 3;
  if (t.includes('crash course')) score += 2;
  if (t.includes('beginner')) score += 2;

  // Basic anti-spam / quality heuristics
  const len = String(title || '').trim().length;
  if (len >= 18 && len <= 90) score += 4;
  if (len < 10) score -= 6;
  if (len > 140) score -= 4;

  if (t.includes('free download') || t.includes('100%') || t.includes('guaranteed')) score -= 8;

  return clamp(score, 0, 10);
};

const getEngagementSignalsScore = (resource) => {
  // Only meaningful when metrics exist (e.g. YouTube).
  const views = Number(resource?.viewCount);
  const likes = Number(resource?.likeCount);
  const rating = Number(resource?.rating);
  const ratingCount = Number(resource?.ratingCount);

  let score = 7; // neutral baseline

  // Views: log-scaled. (2M views >> 100 views)
  if (Number.isFinite(views) && views > 0) {
    const log = Math.log10(views); // 2 -> 100, 6.3 -> 2M
    score += clamp((log - 2) * 2.2, 0, 7); // 100 views ~0, 10M views ~ ~7
  }

  // Likes: small bonus (when available)
  if (Number.isFinite(likes) && likes > 0) {
    const log = Math.log10(likes);
    score += clamp((log - 1) * 1.2, 0, 3); // 10 likes -> 0, 10k likes -> ~3
  }

  // Ratings (non-YouTube platforms, if you later add)
  if (Number.isFinite(rating) && rating > 0) {
    score += clamp((rating - 3.5) * 2, 0, 3); // 4.5+ helps
  }
  if (Number.isFinite(ratingCount) && ratingCount > 0) {
    score += clamp((Math.log10(ratingCount) - 1) * 0.6, 0, 2);
  }

  return clamp(score, 0, 15);
};

const getDurationFitScore = ({ resource, expectedMinutes }) => {
  // expectedMinutes: how long the subtopic should take (rough).
  // Penalize extremes: very short for complex, very long for simple.
  const seconds = Number(resource?.durationSeconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return 6; // unknown = slightly-positive neutral

  const actualMin = seconds / 60;
  // Hard preference for short learning clips (per requirement): 3–10 minutes
  if (actualMin < 3 || actualMin > 10) return 1;

  const expected = Number(expectedMinutes);
  if (!Number.isFinite(expected) || expected <= 0) return 6;

  const ratio = actualMin / expected;
  // Best range is roughly 0.4x .. 1.8x of expected. Outside => penalties.
  if (ratio >= 0.4 && ratio <= 1.8) return 10;
  if (ratio >= 0.25 && ratio <= 2.5) return 7;
  if (ratio >= 0.15 && ratio <= 4) return 4;
  return 1;
};

/**
 * Returns:
 * - effectivenessScore (0..100)
 * - matrixBreakdown per dimension
 * - verificationNotes (short reasons)
 */
const scoreResourceWithMatrix = ({ resource, topicTitle, subtopicTitle, expectedMinutes }) => {
  const haystack = `${resource?.title || ''} ${resource?.channelName || ''} ${resource?.sourceQuery || ''}`.toLowerCase();
  const topicKeywords = toKeywordSet(topicTitle);
  const subtopicKeywords = toKeywordSet(subtopicTitle);

  // Relevance: max 35
  let relevance = 0;
  relevance += scoreKeywordOverlap(haystack, topicKeywords, 2);
  relevance += scoreKeywordOverlap(haystack, subtopicKeywords, 4);
  if (haystack.includes(String(subtopicTitle || '').toLowerCase())) relevance += 6;
  if (haystack.includes(String(topicTitle || '').toLowerCase())) relevance += 3;
  relevance = clamp(relevance, 0, 35);

  const sourceReliability = clamp(getPlatformReliabilityScore(resource?.platform), 0, 20);
  const freshness = clamp(getFreshnessScore(resource?.publishedDate), 0, 10);
  const engagementSignals = clamp(getEngagementSignalsScore(resource), 0, 15);
  const durationFit = clamp(getDurationFitScore({ resource, expectedMinutes }), 0, 10);
  const contentSignals = clamp(getContentSignalsScore(resource?.title), 0, 10);

  const effectivenessScore = clamp(
    relevance + sourceReliability + freshness + engagementSignals + durationFit + contentSignals,
    0,
    100
  );

  const notes = [];
  if (relevance >= 26) notes.push('High relevance to topic/subtopic keywords');
  if (engagementSignals >= 12) notes.push('Strong engagement (views/likes/ratings)');
  if (durationFit >= 9) notes.push('Good duration for this concept');
  if (sourceReliability >= 14) notes.push('Trusted platform/source');
  if (freshness >= 8) notes.push('Recent content');
  if (contentSignals >= 8) notes.push('Good tutorial/explainer signals');
  if (notes.length === 0) notes.push('Basic match (consider reviewing)');

  return {
    effectivenessScore,
    matrix: {
      relevance,
      sourceReliability,
      freshness,
      engagementSignals,
      durationFit,
      contentSignals,
      total: effectivenessScore,
    },
    verificationNotes: notes.slice(0, 3),
  };
};

const RESOURCE_EFFECTIVENESS_MATRIX = {
  name: 'VisoryResourceEffectivenessMatrix_v2',
  scoreRange: [0, 100],
  dimensions: [
    { key: 'relevance', weightMax: 35, description: 'Keyword match to topic/subtopic + intent cues' },
    { key: 'sourceReliability', weightMax: 20, description: 'Platform reliability heuristic' },
    { key: 'freshness', weightMax: 10, description: 'Recency of published content (if available)' },
    { key: 'engagementSignals', weightMax: 15, description: 'Views/likes/ratings when available (log-scaled)' },
    { key: 'durationFit', weightMax: 10, description: 'Duration appropriateness vs expected study time' },
    { key: 'contentSignals', weightMax: 10, description: 'Tutorial/explained cues + anti-spam heuristics' },
  ],
};

module.exports = { RESOURCE_EFFECTIVENESS_MATRIX, scoreResourceWithMatrix };

