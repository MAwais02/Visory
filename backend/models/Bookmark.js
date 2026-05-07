const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  topicId: mongoose.Schema.Types.ObjectId,
  resource: {
    title: String,
    url: { type: String, required: true },
    type: String,
    platform: String,
    thumbnail: String,
  },
  personalNote: String,
  tags: [String],
}, { timestamps: true });

bookmarkSchema.index({ userId: 1, 'resource.url': 1 }, { unique: true });

// Mongoose caches models by name within a running process.
// If a previous schema registered Bookmark.resource incorrectly (e.g., as String),
// we must drop the cached model before re-registering.
const cached = mongoose.models.Bookmark;
if (cached) {
  const resourcePath = cached.schema?.path('resource');
  const isWrong = resourcePath && resourcePath.instance === 'String';
  if (isWrong) {
    delete mongoose.models.Bookmark;
    delete mongoose.modelSchemas.Bookmark;
  }
}

module.exports = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);

