/**
 * 6.1.9 Adaptive learning — rules from quiz performance + engagement (Progress).
 * Drives resource query bias, pace hints, and quiz difficulty overlay (FYP-friendly, explainable).
 */

const DIFF_ORDER = ['beginner', 'intermediate', 'advanced'];

const clampDifficulty = (d) => {
  const s = String(d || 'beginner').toLowerCase();
  if (DIFF_ORDER.includes(s)) return s;
  return 'beginner';
};

const stepDifficulty = (d, delta) => {
  const i = DIFF_ORDER.indexOf(clampDifficulty(d));
  const j = Math.max(0, Math.min(DIFF_ORDER.length - 1, i + delta));
  return DIFF_ORDER[j];
};

/**
 * @param {import('mongoose').Document | null} progress
 * @returns {'low'|'medium'|'high'}
 */
const computeEngagementLevel = (progress) => {
  if (!progress) return 'medium';
  const minutes = Number(progress.totalTimeSpent) || 0;
  const streak = Number(progress.currentStreak) || 0;
  const last7 = Array.isArray(progress.studyLog)
    ? progress.studyLog.slice(-7).reduce((s, l) => s + (Number(l.minutesSpent) || 0), 0)
    : 0;
  if (minutes >= 240 && (streak >= 3 || last7 >= 90)) return 'high';
  if (minutes < 45 && streak <= 1 && last7 < 20) return 'low';
  return 'medium';
};

const defaultAdaptive = () => ({
  resourceNuance: 'core',
  paceHint: 'standard',
  difficultyAdjustment: 'same',
  effectiveQuizDifficulty: null,
  engagementLevel: 'medium',
  lastQuizScorePct: null,
  lastQuizTopicTitle: null,
  updatedAt: new Date(),
});

/**
 * Merge quiz outcome + engagement into next adaptive snapshot.
 * @param {object} params
 * @param {object|null} params.previous — progress.adaptiveLearning plain object
 * @param {number} params.quizPct — 0..100
 * @param {boolean} params.quizPassed
 * @param {number} params.timeTakenSeconds
 * @param {string} params.topicDifficulty — course topic difficultyLevel
 * @param {string} params.topicTitle
 * @param {'low'|'medium'|'high'} params.engagementLevel
 */
const deriveAdaptiveSnapshot = ({
  previous,
  quizPct,
  quizPassed,
  timeTakenSeconds,
  topicDifficulty,
  topicTitle,
  engagementLevel,
}) => {
  const base = { ...defaultAdaptive(), ...previous };
  const pct = Math.max(0, Math.min(100, Number(quizPct) || 0));
  const topicDiff = clampDifficulty(topicDifficulty);

  let resourceNuance = base.resourceNuance || 'core';
  let paceHint = 'standard';
  let difficultyAdjustment = 'same';

  if (pct < 45 || (!quizPassed && pct < 55)) {
    resourceNuance = 'remedial';
    paceHint = 'slow_down';
    difficultyAdjustment = 'easier';
  } else if (pct < 65) {
    resourceNuance = 'remedial';
    paceHint = 'slow_down';
    difficultyAdjustment = 'same';
  } else if (pct >= 88 && engagementLevel === 'high') {
    resourceNuance = 'stretch';
    paceHint = 'speed_up';
    difficultyAdjustment = 'harder';
  } else if (pct >= 78 && engagementLevel !== 'low') {
    resourceNuance = 'core';
    paceHint = 'standard';
    difficultyAdjustment = pct >= 92 ? 'harder' : 'same';
  } else {
    resourceNuance = 'core';
    paceHint = 'standard';
    difficultyAdjustment = 'same';
  }

  const rushed = Number(timeTakenSeconds) > 0 && Number(timeTakenSeconds) < 45 && pct < 60;
  if (rushed) paceHint = 'slow_down';

  let delta = 0;
  if (difficultyAdjustment === 'easier') delta = -1;
  if (difficultyAdjustment === 'harder') delta = 1;
  const effectiveQuizDifficulty = stepDifficulty(topicDiff, delta);

  return {
    resourceNuance,
    paceHint,
    difficultyAdjustment,
    effectiveQuizDifficulty,
    engagementLevel,
    lastQuizScorePct: pct,
    lastQuizTopicTitle: String(topicTitle || '').slice(0, 200),
    lastQuizPassed: Boolean(quizPassed),
    lastTimeTakenSeconds: Number(timeTakenSeconds) || 0,
    updatedAt: new Date(),
  };
};

/**
 * Text block injected into Gemini resource-query prompt.
 * @param {object|null} adaptive — progress.adaptiveLearning
 */
const resourcePlannerAdaptiveCue = (adaptive) => {
  if (!adaptive || !adaptive.resourceNuance) return '';
  const nu = adaptive.resourceNuance;
  const pace = adaptive.paceHint || 'standard';
  const lines = [];
  if (nu === 'remedial') {
    lines.push('- Learner profile: needs EXTRA support. Prefer beginner-friendly queries with phrases like "for beginners", "explained simply", "step by step", "full tutorial slow pace".');
    lines.push('- Avoid expert-only or "internals" angles; favor gentle introductions.');
  } else if (nu === 'stretch') {
    lines.push('- Learner profile: strong performance. Prefer deeper queries: "advanced", "in depth", "production", "internals", "best practices", "architecture".');
    lines.push('- Include at least one query aimed at documentation or expert walkthroughs when appropriate.');
  } else {
    lines.push('- Learner profile: balanced. Mix foundational and solid intermediate material.');
  }
  if (pace === 'slow_down') lines.push('- Pace: suggest resources that allow self-paced learning (longer tutorials ok).');
  if (pace === 'speed_up') lines.push('- Pace: learner can handle denser material; concise deep dives are welcome.');
  return lines.join('\n');
};

module.exports = {
  computeEngagementLevel,
  deriveAdaptiveSnapshot,
  resourcePlannerAdaptiveCue,
  clampDifficulty,
  stepDifficulty,
};
