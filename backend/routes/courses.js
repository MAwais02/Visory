const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { generateCourse, generateResources, answerCourseDoubt } = require('../utils/aiService');
const { buildSemanticRelevancePayload } = require('../services/semanticRelevanceService');
const { resourcePlannerAdaptiveCue } = require('../services/adaptiveLearningService');

const persistSemanticRelevance = async (courseDoc) => {
  const plain = courseDoc.toObject ? courseDoc.toObject() : courseDoc;
  const { semanticRelevance } = await buildSemanticRelevancePayload(plain);
  courseDoc.semanticRelevance = semanticRelevance;
  await courseDoc.save();
};

// All routes protected
router.use(protect);

// Reject reserved / invalid ids (e.g. GET /courses/generate must not hit /:id and cast "generate" to ObjectId)
router.param('id', (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Course not found.' });
  }
  next();
});

const courseChatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { error: 'Chat limit reached. Please try again later.' },
});

// ─── GET /api/courses ── List user's courses ───────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const courses = await Course.find({ userId: req.user._id, isActive: true })
      .select('-topics.subtopics.resources -roadmapData')
      .sort('-createdAt');
    res.json({ courses });
  } catch (err) { next(err); }
});

// ─── POST /api/courses/generate ── AI Course Generation (4.2.3) ───────────────
router.post('/generate', async (req, res, next) => {
  try {
    const {
      subject, difficulty, specificGoals, targetWeeks
    } = req.body;

    if (!subject) return res.status(400).json({ error: 'Subject is required.' });

    const { profile } = req.user;

    // Call AI service
    const aiCourse = await generateCourse({
      subject,
      difficulty: difficulty || profile.priorKnowledgeLevel || 'beginner',
      learningStyle: profile.learningStyle || 'visual',
      hoursPerWeek: profile.hoursPerWeek || 5,
      priorKnowledge: profile.priorKnowledgeLevel || 'beginner',
      specificGoals: specificGoals || profile.learningObjectives?.join(', '),
      targetWeeks: targetWeeks || 12,
    });

    // Compute timeline
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (targetWeeks || 12) * 7);

    // Assign dates to topics proportionally
    const totalHours = aiCourse.estimatedTotalHours || 60;
    const hoursPerWeek = profile.hoursPerWeek || 5;
    let currentDate = new Date(startDate);

    const topics = aiCourse.topics.map((topic, idx) => {
      const topicWeeks = Math.ceil((topic.estimatedHours / totalHours) * (targetWeeks || 12));
      const topicStart = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + topicWeeks * 7);
      return {
        ...topic,
        startDate: topicStart,
        endDate: new Date(currentDate),
        order: idx,
      };
    });

    // Build roadmap data for visual display
    const roadmapData = {
      nodes: topics.map((t, i) => ({
        id: `topic-${i}`,
        label: t.title,
        order: i,
        type: 'topic',
        difficulty: t.difficultyLevel,
      })),
      edges: topics.slice(1).map((_, i) => ({
        source: `topic-${i}`,
        target: `topic-${i + 1}`,
      })),
    };

    const course = await Course.create({
      userId: req.user._id,
      title: aiCourse.title,
      description: aiCourse.description,
      subject,
      difficulty: difficulty || 'beginner',
      estimatedTotalHours: aiCourse.estimatedTotalHours,
      startDate,
      targetEndDate: endDate,
      hoursPerWeek,
      topics,
      suggestedProjects: aiCourse.suggestedProjects || [],
      roadmapData,
      status: 'active',
      generationParams: {
        learningStyle: profile.learningStyle,
        areasOfInterest: profile.areasOfInterest,
        priorKnowledge: profile.priorKnowledgeLevel,
        specificGoals,
      },
    });

    try {
      await persistSemanticRelevance(course);
    } catch (srErr) {
      console.error('[semanticRelevance] persist after create:', srErr.message);
    }

    // Initialize progress tracking
    await Progress.create({
      userId: req.user._id,
      courseId: course._id,
    });

    res.status(201).json({ course });
  } catch (err) { next(err); }
});

// ─── GET /api/courses/:id ── Get single course ─────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.user._id });
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    res.json({ course });
  } catch (err) { next(err); }
});

/** Recompute outline semantic relevance (HF embeddings) from stored title, description, and topic titles. */
router.post('/:id/semantic-relevance', async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.user._id });
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    await persistSemanticRelevance(course);
    res.json({ course });
  } catch (err) { next(err); }
});

// ─── POST /api/courses/:id/chat ── Course doubt chatbot (Gemini) ──────────────
router.post('/:id/chat', courseChatLimiter, async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.user._id });
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const { message, messages } = req.body || {};
    const userMessage = String(message || '').trim();
    const history = Array.isArray(messages) ? messages : [];
    const combined = userMessage ? [...history, { role: 'user', content: userMessage }] : history;

    if (!userMessage && combined.length === 0) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const answer = await answerCourseDoubt({ course, messages: combined });
    res.json({ answer });
  } catch (err) { next(err); }
});

// ─── PUT /api/courses/:id ── Update/edit course (4.2.13) ──────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.user._id });
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const allowed = ['title', 'description', 'topics', 'targetEndDate', 'hoursPerWeek', 'suggestedProjects'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) course[field] = req.body[field];
    });

    await course.save();
    res.json({ course });
  } catch (err) { next(err); }
});

// ─── POST /api/courses/:id/regenerate ── Regenerate course (4.2.13) ──────────
router.post('/:id/regenerate', async (req, res, next) => {
  try {
    const existing = await Course.findOne({ _id: req.params.id, userId: req.user._id });
    if (!existing) return res.status(404).json({ error: 'Course not found.' });

    const newParams = { ...req.body };
    const { profile } = req.user;

    const aiCourse = await generateCourse({
      subject: newParams.subject || existing.subject,
      difficulty: newParams.difficulty || existing.difficulty,
      learningStyle: profile.learningStyle,
      hoursPerWeek: newParams.hoursPerWeek || existing.hoursPerWeek,
      priorKnowledge: profile.priorKnowledgeLevel,
      specificGoals: newParams.specificGoals,
      targetWeeks: newParams.targetWeeks || 12,
    });

    existing.topics = aiCourse.topics;
    existing.suggestedProjects = aiCourse.suggestedProjects;
    existing.version += 1;
    existing.status = 'active';

    try {
      await persistSemanticRelevance(existing);
    } catch (srErr) {
      console.error('[semanticRelevance] persist after regenerate:', srErr.message);
      await existing.save();
    }

    res.json({ course: existing });
  } catch (err) { next(err); }
});

// ─── POST /api/courses/:id/topics/:topicId/resources ── Get topic resources (4.2.4)
router.post('/:id/topics/:topicIndex/resources', async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.user._id });
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const topic = course.topics[req.params.topicIndex];
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });

    const parsedSubtopicIndex = Number(req.body.subtopicIndex);
    const hasExplicitSubtopic = Number.isInteger(parsedSubtopicIndex);
    const targetSubtopic = hasExplicitSubtopic ? topic.subtopics[parsedSubtopicIndex] : null;

    if (hasExplicitSubtopic && !targetSubtopic) {
      return res.status(404).json({ error: 'Subtopic not found.' });
    }

    const progress = await Progress.findOne({ userId: req.user._id, courseId: course._id });
    const adaptiveCue = resourcePlannerAdaptiveCue(progress?.adaptiveLearning);
    const adaptiveResourceNuance = progress?.adaptiveLearning?.resourceNuance || 'core';

    const resources = await generateResources({
      topicTitle: topic.title,
      subtopicTitle: targetSubtopic?.title || req.body.subtopic || topic.title,
      difficulty: topic.difficultyLevel,
      learningStyle: req.user.profile.learningStyle,
      expectedMinutes: Math.max(10, Math.round(((targetSubtopic?.estimatedHours || 1) * 60))),
      adaptiveCue,
      adaptiveResourceNuance,
    });

    if (hasExplicitSubtopic && targetSubtopic) {
      targetSubtopic.resources = resources.slice(0, 3);
    } else {
      // Backward-compatible behavior when no subtopic is specified.
      topic.subtopics.forEach((sub) => {
        if (!sub.resources || sub.resources.length === 0) {
          sub.resources = resources.slice(0, 3);
        }
      });
    }
    await course.save();

    res.json({ resources, subtopicIndex: hasExplicitSubtopic ? parsedSubtopicIndex : null });
  } catch (err) { next(err); }
});

// ─── PATCH /api/courses/:id/topics/:topicIndex/complete ── Mark topic done
router.patch('/:id/topics/:topicIndex/complete', async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.user._id });
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const topic = course.topics[req.params.topicIndex];
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });

    topic.isCompleted = true;
    topic.completedAt = new Date();
    course.completionPercentage = course.calculateProgress();
    if (course.completionPercentage === 100) course.status = 'completed';
    await course.save();

    // Update progress
    await Progress.findOneAndUpdate(
      { userId: req.user._id, courseId: course._id },
      {
        $addToSet: { topicsCompleted: topic._id },
        completionPercentage: course.completionPercentage,
        lastStudiedAt: new Date(),
      }
    );

    res.json({ course, completionPercentage: course.completionPercentage });
  } catch (err) { next(err); }
});

// ─── DELETE /api/courses/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    res.json({ message: 'Course archived.' });
  } catch (err) { next(err); }
});

module.exports = router;