// /**
//  * RAG (Retrieval Augmented Generation) Service
//  * 
//  * How it works:
//  * 1. When a course is generated, embed its description and store in MongoDB
//  * 2. When generating a NEW course, find similar past courses using cosine similarity
//  * 3. Inject those similar courses as context into the Gemini prompt
//  * 4. Result: better, more consistent course generation grounded in real examples
//  */

// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const mongoose = require('mongoose');

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// const courseEmbeddingSchema = new mongoose.Schema({
//   courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
//   subject: String,
//   difficulty: String,
//   title: String,
//   description: String,
//   topicTitles: [String],         // titles of all topics for context
//   embedding: [Number],           // 768-dimensional vector from Gemini
//   createdAt: { type: Date, default: Date.now },
// });

// const CourseEmbedding = mongoose.models.CourseEmbedding ||
//   mongoose.model('CourseEmbedding', courseEmbeddingSchema);


// const generateEmbedding = async (text) => {
//   try {
//     const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
//     const result = await embeddingModel.embedContent(text);
//     return result.embedding.values; // returns array of 768 numbers
//   } catch (err) {
//     console.error('Embedding generation failed:', err.message);
//     return null;
//   }
// };


// const storeCourseEmbedding = async (course) => {
//   try {
//     // Combine key course info into one text for embedding
//     const textToEmbed = `
//       Subject: ${course.subject}
//       Title: ${course.title}
//       Difficulty: ${course.difficulty}
//       Description: ${course.description}
//       Topics: ${course.topics.map(t => t.title).join(', ')}
//     `.trim();

//     const embedding = await generateEmbedding(textToEmbed);
//     if (!embedding) return;

//     // Upsert — update if exists, create if not
//     await CourseEmbedding.findOneAndUpdate(
//       { courseId: course._id },
//       {
//         courseId: course._id,
//         subject: course.subject,
//         difficulty: course.difficulty,
//         title: course.title,
//         description: course.description,
//         topicTitles: course.topics.map(t => t.title),
//         embedding,
//       },
//       { upsert: true, new: true }
//     );

//     console.log(`📦 RAG: Stored embedding for "${course.title}"`);
//   } catch (err) {
//     console.error('RAG store error:', err.message);
//     // Non-critical — don't crash the app if embedding fails
//   }
// };


// const cosineSimilarity = (vecA, vecB) => {
//   if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
//   let dot = 0, normA = 0, normB = 0;
//   for (let i = 0; i < vecA.length; i++) {
//     dot += vecA[i] * vecB[i];
//     normA += vecA[i] * vecA[i];
//     normB += vecB[i] * vecB[i];
//   }
//   return dot / (Math.sqrt(normA) * Math.sqrt(normB));
// };


// const retrieveSimilarCourses = async ({ subject, difficulty, specificGoals }) => {
//   try {
//     // Embed the new request
//     const queryText = `Subject: ${subject} Difficulty: ${difficulty} Goals: ${specificGoals || ''}`;
//     const queryEmbedding = await generateEmbedding(queryText);
//     if (!queryEmbedding) return [];

//     // Load all stored embeddings from MongoDB
//     const allEmbeddings = await CourseEmbedding.find({}).limit(100);
//     if (!allEmbeddings.length) return [];

//     // Score each stored course by similarity to current request
//     const scored = allEmbeddings
//       .map(doc => ({
//         title: doc.title,
//         subject: doc.subject,
//         difficulty: doc.difficulty,
//         description: doc.description,
//         topicTitles: doc.topicTitles,
//         score: cosineSimilarity(queryEmbedding, doc.embedding),
//       }))
//       .filter(doc => doc.score > 0.6)   
//       .sort((a, b) => b.score - a.score) 
//       .slice(0, 3);                      

//     console.log(` RAG: Found ${scored.length} similar course(s) for context`);
//     return scored;
//   } catch (err) {
//     console.error('RAG retrieval error:', err.message);
//     return [];
//   }
// };


// const buildRAGContext = (similarCourses) => {
//   if (!similarCourses.length) return '';

//   const examples = similarCourses.map((c, i) => `
// Example ${i + 1} (${Math.round(c.score * 100)}% similar):
// - Title: ${c.title}
// - Subject: ${c.subject} | Difficulty: ${c.difficulty}
// - Topics covered: ${c.topicTitles.slice(0, 6).join(' → ')}
// `).join('\n');

//   return `
// REFERENCE EXAMPLES (similar successful courses from our database):
// ${examples}
// Use these as structural reference. Follow similar topic progression patterns where appropriate.
// ---`;
// };

// module.exports = {
//   storeCourseEmbedding,
//   retrieveSimilarCourses,
//   buildRAGContext,
//   CourseEmbedding,
// };