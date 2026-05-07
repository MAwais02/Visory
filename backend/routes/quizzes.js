const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const { generateQuiz, getAdaptiveSuggestion } = require('../utils/aiService');

router.use(protect);

// ─── POST /api/quizzes/generate ── AI Quiz Generation (4.2.9) ─────────────────
router.post('/generate', async (req, res, next) => {
  try {
    const { courseId, topicIndex, questionCount } = req.body;

    const course = await Course.findOne({ _id: courseId, userId: req.user._id });
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const topic = course.topics[topicIndex];
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });

    const subtopicTitles = topic.subtopics.map(s => s.title);

    const quizData = await generateQuiz({
      topicTitle: topic.title,
      subtopics: subtopicTitles,
      difficulty: topic.difficultyLevel,
      questionCount: questionCount || 10,
    });

    const totalPoints = quizData.questions.reduce((sum, q) => sum + (q.points || 1), 0);

    const quiz = await Quiz.create({
      courseId,
      userId: req.user._id,
      topicId: topic._id,
      topicTitle: topic.title,
      title: quizData.title,
      description: quizData.description,
      questions: quizData.questions,
      totalPoints,
    });

    res.status(201).json({ quiz });
  } catch (err) { next(err); }
});

// ─── GET /api/quizzes/course/:courseId ── Get quizzes for course ──────────────
router.get('/course/:courseId', async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId, userId: req.user._id })
      .select('-questions.correctAnswer -questions.explanation');
    res.json({ quizzes });
  } catch (err) { next(err); }
});

// ─── GET /api/quizzes/:id ── Get quiz (hide answers) ─────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id })
      .select('-questions.correctAnswer -questions.explanation');
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
    res.json({ quiz });
  } catch (err) { next(err); }
});

// ─── POST /api/quizzes/:id/submit ── Submit quiz attempt ─────────────────────
router.post('/:id/submit', async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    const { answers, timeTaken } = req.body; // answers: [{questionId, answer}]

    let score = 0;
    const gradedAnswers = quiz.questions.map(q => {
      const userAnswer = answers.find(a => a.questionId === q._id.toString());
      const isCorrect = userAnswer?.answer?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
      if (isCorrect) score += q.points || 1;
      return {
        questionId: q._id,
        userAnswer: userAnswer?.answer || '',
        isCorrect,
        pointsEarned: isCorrect ? (q.points || 1) : 0,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      };
    });

    const percentage = Math.round((score / quiz.totalPoints) * 100);
    const passed = percentage >= quiz.passingScore;

    const attempt = {
      userId: req.user._id,
      answers: gradedAnswers,
      score,
      percentage,
      timeTaken,
      passed,
      completedAt: new Date(),
    };

    quiz.attempts.push(attempt);
    if (percentage > quiz.bestScore) quiz.bestScore = percentage;
    if (passed) quiz.isCompleted = true;
    await quiz.save();

    // Adaptive suggestion (4.2.8)
    let adaptiveSuggestion = null;
    try {
      adaptiveSuggestion = await getAdaptiveSuggestion({
        topicTitle: quiz.topicTitle,
        quizScore: percentage,
        timeSpent: timeTaken,
        difficulty: 'intermediate',
      });
    } catch (e) { /* non-blocking */ }

    res.json({
      attempt: { ...attempt, gradedAnswers },
      score,
      percentage,
      passed,
      bestScore: quiz.bestScore,
      adaptiveSuggestion,
    });
  } catch (err) { next(err); }
});

module.exports = router;
