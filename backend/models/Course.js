const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: String,
  url: String,
  type: { type: String, enum: ['video', 'article', 'course', 'github', 'book', 'other'] },
  platform: { type: String, enum: ['YouTube', 'Coursera', 'Udemy', 'Medium', 'GitHub', 'Other'] },
  duration: String,
  durationSeconds: Number,
  thumbnail: String,
  rating: Number,
  ratingCount: Number,
  viewCount: Number,
  likeCount: Number,
  channelName: String,
  publishedDate: Date,
  sourceQuery: String,
  isBookmarked: { type: Boolean, default: false },
  // FYP: verification + effectiveness matrix (static, at fetch-time)
  verification: {
    matrixName: String,
    effectivenessScore: { type: Number, default: 0 },
    breakdown: {
      relevance: Number,
      sourceReliability: Number,
      freshness: Number,
      engagementSignals: Number,
      durationFit: Number,
      contentSignals: Number,
      total: Number,
    },
    notes: [String],
    verifiedAt: Date,
  },
});

const subtopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  estimatedHours: { type: Number, default: 1 },
  resources: [resourceSchema],
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
  notes: String,
  order: Number,
});

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  estimatedHours: { type: Number, default: 2 },
  subtopics: [subtopicSchema],
  dependencies: [{ type: mongoose.Schema.Types.ObjectId }], // IDs of prerequisite topics
  startDate: Date,
  endDate: Date,
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
  order: Number,
  difficultyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  quizScore: Number,
});

const courseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  subject: String,
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  estimatedTotalHours: Number,

  // 4.2.5 - Timeline
  startDate: Date,
  targetEndDate: Date,
  hoursPerWeek: Number,

  // 4.2.3 - AI generated syllabus
  topics: [topicSchema],

  // 4.2.6 - Visual Roadmap
  roadmapData: { type: mongoose.Schema.Types.Mixed }, // JSON for node graph

  // 4.2.10 - Project Suggestions
  suggestedProjects: [{
    title: String,
    description: String,
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    expectedOutcomes: [String],
    technologies: [String],
    estimatedHours: Number,
  }],

  // Generation metadata
  generationParams: {
    learningStyle: String,
    areasOfInterest: [String],
    priorKnowledge: String,
    specificGoals: String,
  },

  // Status
  status: { type: String, enum: ['generating', 'active', 'completed', 'archived'], default: 'generating' },
  completionPercentage: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },
  version: { type: Number, default: 1 }, // for course regeneration tracking
}, { timestamps: true });

// Auto-calculate completion percentage
courseSchema.methods.calculateProgress = function () {
  const allTopics = this.topics;
  if (!allTopics.length) return 0;
  const completed = allTopics.filter(t => t.isCompleted).length;
  return Math.round((completed / allTopics.length) * 100);
};

module.exports = mongoose.model('Course', courseSchema);
