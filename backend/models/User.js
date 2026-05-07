const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['learner', 'admin'], default: 'learner' },

  // OAuth
  googleId: { type: String, sparse: true },
  microsoftId: { type: String, sparse: true },
  authProvider: { type: String, enum: ['local', 'google', 'microsoft'], default: 'local' },

  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // 4.2.2 - User Profile Setup
  profile: {
    learningObjectives: [String],
    areasOfInterest: [String],
    priorKnowledgeLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    learningStyle: { type: String, enum: ['visual', 'auditory', 'reading', 'kinesthetic'], default: 'visual' },
    hoursPerWeek: { type: Number, default: 5, min: 1, max: 168 },
    bio: String,
    timezone: { type: String, default: 'UTC' },
  },

  // Notification preferences
  notificationPrefs: {
    emailReminders: { type: Boolean, default: true },
    inAppNotifications: { type: Boolean, default: true },
    milestoneAlerts: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
  },

  isActive: { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
