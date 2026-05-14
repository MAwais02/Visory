const mongoose = require('mongoose');

// Remove stale in-memory model (old code registered `Bookmark` with `resource: String`).
try {
  mongoose.deleteModel('Bookmark');
} catch {
  // ignore if not registered
}
delete mongoose.models.Bookmark;
if (mongoose.modelSchemas?.Bookmark) delete mongoose.modelSchemas.Bookmark;

const resourceSchema = new mongoose.Schema(
  {
    title: String,
    url: { type: String, required: true },
    type: String,
    platform: String,
    thumbnail: String,
  },
  { _id: false }
);

const courseBookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    topicId: mongoose.Schema.Types.ObjectId,
    resource: { type: resourceSchema, required: true },
    personalNote: String,
    tags: [String],
  },
  { timestamps: true }
);

courseBookmarkSchema.index({ userId: 1, 'resource.url': 1 }, { unique: true });

// New model name avoids any phantom `Bookmark` schema. Same MongoDB collection `bookmarks`.
module.exports = mongoose.model('CourseBookmark', courseBookmarkSchema, 'bookmarks');
