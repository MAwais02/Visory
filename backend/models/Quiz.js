const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { type: String, enum: ['multiple_choice', 'true_false', 'short_answer'], required: true },
  options: [String], // for MCQ
  correctAnswer: { type: String, required: true },
  explanation: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  points: { type: Number, default: 1 },
});

const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    userAnswer: String,
    isCorrect: Boolean,
    pointsEarned: Number,
  }],
  score: Number,         // raw score
  percentage: Number,    // 0-100
  timeTaken: Number,     // seconds
  completedAt: { type: Date, default: Date.now },
  passed: Boolean,
});

const quizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: mongoose.Schema.Types.ObjectId,
  topicTitle: String,

  title: { type: String, required: true },
  description: String,
  questions: [questionSchema],
  totalPoints: Number,
  passingScore: { type: Number, default: 60 }, // percentage

  // 4.2.9
  timeLimit: { type: Number, default: 30 }, // minutes (0 = no limit)

  attempts: [attemptSchema],
  bestScore: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
