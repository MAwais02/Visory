/**
 * Semantic relevance for a stored Course document:
 * embeds course intent vs each topics[].title using Hugging Face weights
 * (sentence-transformers/all-MiniLM-L6-v2 ONNX via @xenova/transformers).
 *
 * We do NOT concatenate title + full description into one giant string: mean-pooled
 * embeddings over long text pull away from short topic-title vectors and deflate cosine.
 * Instead: blend normalized embeddings of (title) and (short description excerpt).
 */

const { pipeline } = require('@xenova/transformers');

const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
const MAX_DESC_SNIPPET = 520;

let embedderPromise;

const getEmbedder = () => {
  if (!embedderPromise) {
    embedderPromise = pipeline('feature-extraction', EMBEDDING_MODEL);
  }
  return embedderPromise;
};

const truncate = (s, max) => {
  const t = String(s || '').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
};

const embedText = async (text) => {
  const t = String(text || '').trim();
  if (!t) return null;
  const extractor = await getEmbedder();
  const out = await extractor(t, { pooling: 'mean', normalize: true });
  return Array.from(out.data);
};

const dot = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.length; i += 1) s += a[i] * b[i];
  return s;
};

const l2Normalize = (vec) => {
  let n = 0;
  for (let i = 0; i < vec.length; i += 1) n += vec[i] * vec[i];
  n = Math.sqrt(n);
  if (n < 1e-12) return vec;
  return vec.map((x) => x / n);
};

/** Weighted average of already L2-normalized embedding vectors, then L2-normalize. */
const blendNormalizedVectors = (pairs) => {
  const vecs = pairs.map((p) => p.v).filter(Boolean);
  const weights = pairs.map((p) => p.w);
  if (!vecs.length) return null;
  const dim = vecs[0].length;
  const acc = new Array(dim).fill(0);
  let wSum = 0;
  for (let i = 0; i < vecs.length; i += 1) {
    const w = Math.max(0, weights[i]);
    wSum += w;
    for (let j = 0; j < dim; j += 1) acc[j] += vecs[i][j] * w;
  }
  if (wSum < 1e-12) return vecs[0];
  for (let j = 0; j < dim; j += 1) acc[j] /= wSum;
  return l2Normalize(acc);
};

/**
 * Map cosine → 0–100 for "course intent vs module title" (MiniLM, normalized vectors).
 * Floor ~0.22 still maps to 0; typical strong module–title matches land ~0.55–0.85.
 */
const cosineToPercent = (cos) => {
  const p = ((cos - 0.22) / 0.56) * 100;
  return Math.round(Math.min(100, Math.max(0, p)));
};

/**
 * @param {{ title?: string, description?: string, topics?: Array<{ title?: string }> }} course
 */
const buildSemanticRelevancePayload = async (course) => {
  const title = String(course?.title || '').trim();
  const subject = String(course?.subject || '').trim();
  /** Short label so generic module titles ("Arrays and Objects") align with the course domain. */
  const topicContext = subject || truncate((title.split(':')[0] || title).trim(), 56);
  const descSnippet = truncate(String(course?.description || '').trim(), MAX_DESC_SNIPPET);
  const topicTitles = (course?.topics || [])
    .map((t) => String(t?.title || '').trim())
    .filter(Boolean);

  if (!title || topicTitles.length === 0) {
    return {
      semanticRelevance: {
        overallScore: 0,
        moduleScores: [],
        embeddingModel: EMBEDDING_MODEL,
        computedAt: new Date(),
      },
    };
  }

  const titleVec = await embedText(title);
  if (!titleVec) {
    return {
      semanticRelevance: {
        overallScore: 0,
        moduleScores: [],
        embeddingModel: EMBEDDING_MODEL,
        computedAt: new Date(),
      },
    };
  }

  let anchorVec = titleVec;
  if (descSnippet) {
    const descVec = await embedText(descSnippet);
    if (descVec) {
      anchorVec = blendNormalizedVectors([
        { v: titleVec, w: 0.72 },
        { v: descVec, w: 0.28 },
      ]);
    }
  }
  if (!anchorVec) {
    return {
      semanticRelevance: {
        overallScore: 0,
        moduleScores: [],
        embeddingModel: EMBEDDING_MODEL,
        computedAt: new Date(),
      },
    };
  }

  const moduleScores = [];
  let sumCos = 0;

  const topicLineForEmbed = (modTitle) => {
    if (!topicContext) return modTitle;
    const ctx = topicContext.toLowerCase();
    const mod = modTitle.toLowerCase();
    if (mod.includes(ctx.slice(0, Math.min(12, ctx.length)))) return modTitle;
    return `${topicContext}: ${modTitle}`;
  };

  for (const modTitle of topicTitles) {
    const v = await embedText(topicLineForEmbed(modTitle));
    if (!v) continue;
    const cosAnchor = dot(anchorVec, v);
    const cosTitleOnly = dot(titleVec, v);
    // Topic lines are short; some are generic ("Basic Types") vs rich course title — take the stronger signal.
    const cos = Math.max(cosAnchor, cosTitleOnly);
    sumCos += cos;
    moduleScores.push({
      title: modTitle,
      relevance: cosineToPercent(cos),
      cosine: Number(cos.toFixed(4)),
    });
  }

  const avgCos = moduleScores.length ? sumCos / moduleScores.length : 0;
  const overallScore = cosineToPercent(avgCos);

  return {
    semanticRelevance: {
      overallScore,
      moduleScores,
      embeddingModel: EMBEDDING_MODEL,
      computedAt: new Date(),
    },
  };
};

module.exports = {
  buildSemanticRelevancePayload,
  EMBEDDING_MODEL,
};
