// // // // const OpenAI = require('openai');

// // // // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// // // // /**
// // // //  * 4.2.3 - AI Course Generation
// // // //  * Generates a comprehensive course syllabus based on user profile
// // // //  */
// // // // const generateCourse = async ({ subject, difficulty, learningStyle, hoursPerWeek, priorKnowledge, specificGoals, targetWeeks }) => {
// // // //   const prompt = `You are an expert educational curriculum designer. Create a comprehensive, well-structured learning course.

// // // // User Profile:
// // // // - Subject: ${subject}
// // // // - Difficulty Level: ${difficulty}
// // // // - Learning Style: ${learningStyle}
// // // // - Available Hours/Week: ${hoursPerWeek}
// // // // - Prior Knowledge: ${priorKnowledge}
// // // // - Specific Goals: ${specificGoals || 'General mastery'}
// // // // - Target Duration: ${targetWeeks || 12} weeks

// // // // Generate a complete course syllabus in JSON format:
// // // // {
// // // //   "title": "Course title",
// // // //   "description": "Course overview (2-3 sentences)",
// // // //   "estimatedTotalHours": number,
// // // //   "topics": [
// // // //     {
// // // //       "title": "Topic Title",
// // // //       "description": "Topic overview",
// // // //       "estimatedHours": number,
// // // //       "difficultyLevel": "beginner|intermediate|advanced",
// // // //       "order": number,
// // // //       "subtopics": [
// // // //         {
// // // //           "title": "Subtopic Title",
// // // //           "description": "What will be learned",
// // // //           "estimatedHours": number,
// // // //           "order": number
// // // //         }
// // // //       ]
// // // //     }
// // // //   ],
// // // //   "suggestedProjects": [
// // // //     {
// // // //       "title": "Project Title",
// // // //       "description": "What to build",
// // // //       "difficulty": "beginner|intermediate|advanced",
// // // //       "expectedOutcomes": ["outcome1", "outcome2"],
// // // //       "technologies": ["tech1"],
// // // //       "estimatedHours": number
// // // //     }
// // // //   ]
// // // // }

// // // // Important:
// // // // - Create 6-12 main topics with 3-5 subtopics each
// // // // - Order topics by logical progression and dependencies
// // // // - Adjust complexity to ${difficulty} level
// // // // - Tailor content for ${learningStyle} learning style
// // // // - Return ONLY valid JSON, no markdown.`;

// // // //   const response = await openai.chat.completions.create({
// // // //     model: process.env.LLM_MODEL || 'gpt-4o-mini',
// // // //     messages: [{ role: 'user', content: prompt }],
// // // //     temperature: 0.7,
// // // //     max_tokens: 4000,
// // // //     response_format: { type: 'json_object' },
// // // //   });

// // // //   const courseData = JSON.parse(response.choices[0].message.content);
// // // //   return courseData;
// // // // };

// // // // /**
// // // //  * 4.2.4 - Resource Recommendation Engine
// // // //  * Generates resource suggestions for a topic (real API calls would be added for YouTube, Coursera etc)
// // // //  */
// // // // const generateResources = async ({ topicTitle, subtopicTitle, difficulty, learningStyle }) => {
// // // //   const prompt = `You are a learning resource curator. Suggest the best learning resources for:
// // // // Topic: ${topicTitle}
// // // // Subtopic: ${subtopicTitle}
// // // // Difficulty: ${difficulty}
// // // // Learning Style: ${learningStyle}

// // // // Return JSON array of 4-6 resources:
// // // // [
// // // //   {
// // // //     "title": "Resource Title",
// // // //     "url": "https://example.com",
// // // //     "type": "video|article|course|github|book",
// // // //     "platform": "YouTube|Coursera|Udemy|Medium|GitHub|Other",
// // // //     "duration": "30 min|2 hours|etc",
// // // //     "rating": 4.5,
// // // //     "thumbnail": ""
// // // //   }
// // // // ]
// // // // Return ONLY valid JSON array, no markdown.`;

// // // //   const response = await openai.chat.completions.create({
// // // //     model: process.env.LLM_MODEL || 'gpt-4o-mini',
// // // //     messages: [{ role: 'user', content: prompt }],
// // // //     temperature: 0.5,
// // // //     max_tokens: 1500,
// // // //     response_format: { type: 'json_object' },
// // // //   });

// // // //   const content = response.choices[0].message.content;
// // // //   const parsed = JSON.parse(content);
// // // //   return Array.isArray(parsed) ? parsed : parsed.resources || [];
// // // // };

// // // // /**
// // // //  * 4.2.9 - Quiz and Assessment Generation
// // // //  */
// // // // const generateQuiz = async ({ topicTitle, subtopics, difficulty, questionCount = 10 }) => {
// // // //   const prompt = `You are an expert educator creating an assessment quiz.

// // // // Topic: ${topicTitle}
// // // // Subtopics covered: ${subtopics.join(', ')}
// // // // Difficulty: ${difficulty}
// // // // Number of questions: ${questionCount}

// // // // Generate a quiz in JSON format:
// // // // {
// // // //   "title": "Quiz: ${topicTitle}",
// // // //   "description": "Test your understanding of ${topicTitle}",
// // // //   "questions": [
// // // //     {
// // // //       "questionText": "Question here?",
// // // //       "type": "multiple_choice|true_false|short_answer",
// // // //       "options": ["A", "B", "C", "D"],
// // // //       "correctAnswer": "A",
// // // //       "explanation": "Why this is correct",
// // // //       "difficulty": "easy|medium|hard",
// // // //       "points": 1
// // // //     }
// // // //   ]
// // // // }

// // // // Rules:
// // // // - Mix: ~50% multiple choice, ~30% true/false, ~20% short answer
// // // // - Distribute easy (30%), medium (50%), hard (20%)
// // // // - Clear, unambiguous questions
// // // // - For true_false: options should be ["True", "False"]
// // // // - For short_answer: correctAnswer is a brief key phrase
// // // // Return ONLY valid JSON, no markdown.`;

// // // //   const response = await openai.chat.completions.create({
// // // //     model: process.env.LLM_MODEL || 'gpt-4o-mini',
// // // //     messages: [{ role: 'user', content: prompt }],
// // // //     temperature: 0.6,
// // // //     max_tokens: 3000,
// // // //     response_format: { type: 'json_object' },
// // // //   });

// // // //   return JSON.parse(response.choices[0].message.content);
// // // // };

// // // // /**
// // // //  * 4.2.8 - Adaptive Learning - Analyze performance and suggest adjustments
// // // //  */
// // // // const getAdaptiveSuggestion = async ({ userId, topicTitle, quizScore, timeSpent, difficulty }) => {
// // // //   const prompt = `A learner is studying "${topicTitle}" at ${difficulty} difficulty.
// // // // Quiz score: ${quizScore}%
// // // // Time spent: ${timeSpent} minutes

// // // // Provide adaptive learning recommendations in JSON:
// // // // {
// // // //   "assessment": "struggling|on_track|excelling",
// // // //   "recommendation": "Brief recommendation text",
// // // //   "adjustDifficulty": "increase|maintain|decrease",
// // // //   "additionalResources": ["resource suggestion 1", "resource suggestion 2"],
// // // //   "studyTips": ["tip 1", "tip 2"]
// // // // }
// // // // Return ONLY valid JSON.`;

// // // //   const response = await openai.chat.completions.create({
// // // //     model: process.env.LLM_MODEL || 'gpt-4o-mini',
// // // //     messages: [{ role: 'user', content: prompt }],
// // // //     temperature: 0.5,
// // // //     max_tokens: 500,
// // // //     response_format: { type: 'json_object' },
// // // //   });

// // // //   return JSON.parse(response.choices[0].message.content);
// // // // };

// // // // module.exports = { generateCourse, generateResources, generateQuiz, getAdaptiveSuggestion };

// // // /**
// // //  * Ollama-based AI Course Generation
// // //  * Uses local Ollama instance instead of OpenAI API
// // //  */

// // // const OLLAMA_BASE_URL = 'http://localhost:11434';
// // // const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2'; // Change to your downloaded model

// // // /**
// // //  * Helper: Call Ollama API
// // //  */
// // // const callOllama = async (prompt) => {
// // //   const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
// // //     method: 'POST',
// // //     headers: { 'Content-Type': 'application/json' },
// // //     body: JSON.stringify({
// // //       model: OLLAMA_MODEL,
// // //       prompt: prompt,
// // //       stream: false,
// // //       format: 'json',        // Forces JSON output (Ollama 0.1.9+)
// // //       options: {
// // //         temperature: 0.7,
// // //         num_predict: 4000,
// // //       },
// // //     }),
// // //   });

// // //   if (!response.ok) {
// // //     throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
// // //   }

// // //   const data = await response.json();
// // //   return data.response;
// // // };

// // // /**
// // //  * Safe JSON parser with fallback
// // //  */
// // // const safeParseJSON = (text) => {
// // //   try {
// // //     return JSON.parse(text);
// // //   } catch {
// // //     // Try to extract JSON from response if model added extra text
// // //     const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
// // //     if (jsonMatch) return JSON.parse(jsonMatch[0]);
// // //     throw new Error('Failed to parse JSON from model response');
// // //   }
// // // };

// // // /**
// // //  * 4.2.3 - AI Course Generation
// // //  */
// // // const generateCourse = async ({ subject, difficulty, learningStyle, hoursPerWeek, priorKnowledge, specificGoals, targetWeeks }) => {
// // //   const prompt = `You are an expert educational curriculum designer. Create a comprehensive, well-structured learning course.

// // // User Profile:
// // // - Subject: ${subject}
// // // - Difficulty Level: ${difficulty}
// // // - Learning Style: ${learningStyle}
// // // - Available Hours/Week: ${hoursPerWeek}
// // // - Prior Knowledge: ${priorKnowledge}
// // // - Specific Goals: ${specificGoals || 'General mastery'}
// // // - Target Duration: ${targetWeeks || 12} weeks

// // // Generate a complete course syllabus in this EXACT JSON format and return ONLY JSON, nothing else:
// // // {
// // //   "title": "Course title",
// // //   "description": "Course overview 2-3 sentences",
// // //   "estimatedTotalHours": 0,
// // //   "topics": [
// // //     {
// // //       "title": "Topic Title",
// // //       "description": "Topic overview",
// // //       "estimatedHours": 0,
// // //       "difficultyLevel": "beginner",
// // //       "order": 1,
// // //       "subtopics": [
// // //         {
// // //           "title": "Subtopic Title",
// // //           "description": "What will be learned",
// // //           "estimatedHours": 0,
// // //           "order": 1
// // //         }
// // //       ]
// // //     }
// // //   ],
// // //   "suggestedProjects": [
// // //     {
// // //       "title": "Project Title",
// // //       "description": "What to build",
// // //       "difficulty": "beginner",
// // //       "expectedOutcomes": ["outcome1"],
// // //       "technologies": ["tech1"],
// // //       "estimatedHours": 0
// // //     }
// // //   ]
// // // }

// // // Requirements:
// // // - Create 6-12 main topics with 3-5 subtopics each
// // // - Order topics by logical progression
// // // - Adjust complexity to ${difficulty} level
// // // - Tailor for ${learningStyle} learning style
// // // - Return ONLY valid JSON, no explanation, no markdown.`;

// // //   const raw = await callOllama(prompt);
// // //   return safeParseJSON(raw);
// // // };

// // // /**
// // //  * 4.2.4 - Resource Recommendation Engine
// // //  */
// // // const generateResources = async ({ topicTitle, subtopicTitle, difficulty, learningStyle }) => {
// // //   const prompt = `You are a learning resource curator. Suggest the best learning resources for:
// // // Topic: ${topicTitle}
// // // Subtopic: ${subtopicTitle}
// // // Difficulty: ${difficulty}
// // // Learning Style: ${learningStyle}

// // // Return a JSON object with a "resources" array of 4-6 items in this EXACT format:
// // // {
// // //   "resources": [
// // //     {
// // //       "title": "Resource Title",
// // //       "url": "https://example.com",
// // //       "type": "video",
// // //       "platform": "YouTube",
// // //       "duration": "30 min",
// // //       "rating": 4.5,
// // //       "thumbnail": ""
// // //     }
// // //   ]
// // // }

// // // type must be one of: video, article, course, github, book
// // // platform must be one of: YouTube, Coursera, Udemy, Medium, GitHub, Other
// // // Return ONLY valid JSON, no explanation, no markdown.`;

// // //   const raw = await callOllama(prompt);
// // //   const parsed = safeParseJSON(raw);
// // //   return Array.isArray(parsed) ? parsed : parsed.resources || [];
// // // };

// // // /**
// // //  * 4.2.9 - Quiz and Assessment Generation
// // //  */
// // // const generateQuiz = async ({ topicTitle, subtopics, difficulty, questionCount = 10 }) => {
// // //   const prompt = `You are an expert educator creating an assessment quiz.

// // // Topic: ${topicTitle}
// // // Subtopics covered: ${subtopics.join(', ')}
// // // Difficulty: ${difficulty}
// // // Number of questions: ${questionCount}

// // // Generate a quiz in this EXACT JSON format:
// // // {
// // //   "title": "Quiz: ${topicTitle}",
// // //   "description": "Test your understanding of ${topicTitle}",
// // //   "questions": [
// // //     {
// // //       "questionText": "Question here?",
// // //       "type": "multiple_choice",
// // //       "options": ["A", "B", "C", "D"],
// // //       "correctAnswer": "A",
// // //       "explanation": "Why this is correct",
// // //       "difficulty": "easy",
// // //       "points": 1
// // //     }
// // //   ]
// // // }

// // // Rules:
// // // - Total ${questionCount} questions
// // // - Mix: 50% multiple_choice, 30% true_false, 20% short_answer
// // // - Difficulty spread: 30% easy, 50% medium, 20% hard
// // // - For true_false: options must be ["True", "False"]
// // // - For short_answer: options is empty array [], correctAnswer is a key phrase
// // // - Return ONLY valid JSON, no markdown, no explanation.`;

// // //   const raw = await callOllama(prompt);
// // //   return safeParseJSON(raw);
// // // };

// // // /**
// // //  * 4.2.8 - Adaptive Learning Suggestions
// // //  */
// // // const getAdaptiveSuggestion = async ({ userId, topicTitle, quizScore, timeSpent, difficulty }) => {
// // //   const prompt = `A learner is studying "${topicTitle}" at ${difficulty} difficulty.
// // // Quiz score: ${quizScore}%
// // // Time spent: ${timeSpent} minutes

// // // Analyze their performance and return ONLY this JSON, no explanation:
// // // {
// // //   "assessment": "on_track",
// // //   "recommendation": "Brief recommendation text here",
// // //   "adjustDifficulty": "maintain",
// // //   "additionalResources": ["resource suggestion 1", "resource suggestion 2"],
// // //   "studyTips": ["tip 1", "tip 2"]
// // // }

// // // assessment must be one of: struggling, on_track, excelling
// // // adjustDifficulty must be one of: increase, maintain, decrease
// // // Return ONLY valid JSON.`;

// // //   const raw = await callOllama(prompt);
// // //   return safeParseJSON(raw);
// // // };

// // // module.exports = { generateCourse, generateResources, generateQuiz, getAdaptiveSuggestion };


// // const { GoogleGenerativeAI } = require('@google/generative-ai');

// // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// // const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite' });

// // /**
// //  * Helper: Call Gemini API
// //  */
// // const callGemini = async (prompt, maxTokens = 4000) => {
// //   const result = await model.generateContent({
// //     contents: [{ role: 'user', parts: [{ text: prompt }] }],
// //     generationConfig: {
// //       temperature: 0.7,
// //       maxOutputTokens: maxTokens,
// //       responseMimeType: 'application/json', // Forces JSON output
// //     },
// //   });

// //   const response = await result.response;
// //   return response.text();
// // };

// // /**
// //  * Safe JSON parser with fallback
// //  */
// // const safeParseJSON = (text) => {
// //   try {
// //     return JSON.parse(text);
// //   } catch {
// //     const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
// //     if (jsonMatch) return JSON.parse(jsonMatch[0]);
// //     throw new Error('Failed to parse JSON from Gemini response');
// //   }
// // };

// // /**
// //  * 4.2.3 - AI Course Generation
// //  */
// // const generateCourse = async ({ subject, difficulty, learningStyle, hoursPerWeek, priorKnowledge, specificGoals, targetWeeks }) => {
// //   const prompt = `You are an expert educational curriculum designer. Create a comprehensive, well-structured learning course.

// // User Profile:
// // - Subject: ${subject}
// // - Difficulty Level: ${difficulty}
// // - Learning Style: ${learningStyle}
// // - Available Hours/Week: ${hoursPerWeek}
// // - Prior Knowledge: ${priorKnowledge}
// // - Specific Goals: ${specificGoals || 'General mastery'}
// // - Target Duration: ${targetWeeks || 12} weeks

// // Generate a complete course syllabus in this EXACT JSON format:
// // {
// //   "title": "Course title",
// //   "description": "Course overview 2-3 sentences",
// //   "estimatedTotalHours": 0,
// //   "topics": [
// //     {
// //       "title": "Topic Title",
// //       "description": "Topic overview",
// //       "estimatedHours": 0,
// //       "difficultyLevel": "beginner|intermediate|advanced",
// //       "order": 1,
// //       "subtopics": [
// //         {
// //           "title": "Subtopic Title",
// //           "description": "What will be learned",
// //           "estimatedHours": 0,
// //           "order": 1
// //         }
// //       ]
// //     }
// //   ],
// //   "suggestedProjects": [
// //     {
// //       "title": "Project Title",
// //       "description": "What to build",
// //       "difficulty": "beginner|intermediate|advanced",
// //       "expectedOutcomes": ["outcome1", "outcome2"],
// //       "technologies": ["tech1"],
// //       "estimatedHours": 0
// //     }
// //   ]
// // }

// // Requirements:
// // - Create 6-12 main topics with 3-5 subtopics each
// // - Order topics by logical progression and dependencies
// // - Adjust complexity to ${difficulty} level
// // - Tailor content for ${learningStyle} learning style
// // - Return ONLY valid JSON, no markdown, no explanation.`;

// //   const raw = await callGemini(prompt, 4000);
// //   return safeParseJSON(raw);
// // };

// // /**
// //  * 4.2.4 - Resource Recommendation Engine
// //  */
// // const generateResources = async ({ topicTitle, subtopicTitle, difficulty, learningStyle }) => {
// //   const prompt = `You are a learning resource curator. Suggest the best learning resources for:
// // Topic: ${topicTitle}
// // Subtopic: ${subtopicTitle}
// // Difficulty: ${difficulty}
// // Learning Style: ${learningStyle}

// // Return a JSON object with a "resources" array of 4-6 items in this EXACT format:
// // {
// //   "resources": [
// //     {
// //       "title": "Resource Title",
// //       "url": "https://example.com",
// //       "type": "video|article|course|github|book",
// //       "platform": "YouTube|Coursera|Udemy|Medium|GitHub|Other",
// //       "duration": "30 min",
// //       "rating": 4.5,
// //       "thumbnail": ""
// //     }
// //   ]
// // }
// // Return ONLY valid JSON, no markdown, no explanation.`;

// //   const raw = await callGemini(prompt, 1500);
// //   const parsed = safeParseJSON(raw);
// //   return Array.isArray(parsed) ? parsed : parsed.resources || [];
// // };

// // /**
// //  * 4.2.9 - Quiz and Assessment Generation
// //  */
// // const generateQuiz = async ({ topicTitle, subtopics, difficulty, questionCount = 10 }) => {
// //   const prompt = `You are an expert educator creating an assessment quiz.

// // Topic: ${topicTitle}
// // Subtopics covered: ${subtopics.join(', ')}
// // Difficulty: ${difficulty}
// // Number of questions: ${questionCount}

// // Generate a quiz in this EXACT JSON format:
// // {
// //   "title": "Quiz: ${topicTitle}",
// //   "description": "Test your understanding of ${topicTitle}",
// //   "questions": [
// //     {
// //       "questionText": "Question here?",
// //       "type": "multiple_choice|true_false|short_answer",
// //       "options": ["A", "B", "C", "D"],
// //       "correctAnswer": "A",
// //       "explanation": "Why this is correct",
// //       "difficulty": "easy|medium|hard",
// //       "points": 1
// //     }
// //   ]
// // }

// // Rules:
// // - Total ${questionCount} questions
// // - Mix: 50% multiple_choice, 30% true_false, 20% short_answer
// // - Difficulty spread: 30% easy, 50% medium, 20% hard
// // - For true_false: options must be ["True", "False"]
// // - For short_answer: options is empty array [], correctAnswer is a key phrase
// // - Return ONLY valid JSON, no markdown, no explanation.`;

// //   const raw = await callGemini(prompt, 3000);
// //   return safeParseJSON(raw);
// // };

// // /**
// //  * 4.2.8 - Adaptive Learning Suggestions
// //  */
// // const getAdaptiveSuggestion = async ({ userId, topicTitle, quizScore, timeSpent, difficulty }) => {
// //   const prompt = `A learner is studying "${topicTitle}" at ${difficulty} difficulty.
// // Quiz score: ${quizScore}%
// // Time spent: ${timeSpent} minutes

// // Analyze performance and return ONLY this JSON:
// // {
// //   "assessment": "struggling|on_track|excelling",
// //   "recommendation": "Brief recommendation text",
// //   "adjustDifficulty": "increase|maintain|decrease",
// //   "additionalResources": ["resource suggestion 1", "resource suggestion 2"],
// //   "studyTips": ["tip 1", "tip 2"]
// // }
// // Return ONLY valid JSON, no markdown, no explanation.`;

// //   const raw = await callGemini(prompt, 500);
// //   return safeParseJSON(raw);
// // };

// // module.exports = { generateCourse, generateResources, generateQuiz, getAdaptiveSuggestion };

// const { GoogleGenerativeAI } = require('@google/generative-ai');

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

// /**
//  * Clean AI response text before parsing
//  */
// const cleanJSON = (text) => {
//   // Remove markdown code blocks
//   text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

//   // Remove any text before first { or [
//   const firstBrace = text.indexOf('{');
//   const firstBracket = text.indexOf('[');

//   let startIndex = -1;
//   if (firstBrace === -1) startIndex = firstBracket;
//   else if (firstBracket === -1) startIndex = firstBrace;
//   else startIndex = Math.min(firstBrace, firstBracket);

//   if (startIndex > 0) text = text.substring(startIndex);

//   // Remove any text after last } or ]
//   const lastBrace = text.lastIndexOf('}');
//   const lastBracket = text.lastIndexOf(']');
//   const endIndex = Math.max(lastBrace, lastBracket);
//   if (endIndex !== -1) text = text.substring(0, endIndex + 1);

//   // Fix common AI JSON mistakes
//   text = text
//     .replace(/,\s*}/g, '}')              // trailing comma in object
//     .replace(/,\s*]/g, ']')              // trailing comma in array
//     .replace(/[\x00-\x1F\x7F]/g, ' ')   // control characters
//     .replace(/\\'/g, "'")                // wrong escape
//     .replace(/"\s*:\s*undefined/g, '": null'); // undefined values

//   return text.trim();
// };

// /**
//  * Safe JSON parser with 3 fallback attempts
//  */
// const safeParseJSON = (text) => {
//   // Attempt 1: direct parse
//   try {
//     return JSON.parse(text);
//   } catch (e1) {
//     // Attempt 2: clean then parse
//     try {
//       const cleaned = cleanJSON(text);
//       return JSON.parse(cleaned);
//     } catch (e2) {
//       // Attempt 3: extract JSON block then parse
//       try {
//         const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
//         if (jsonMatch) return JSON.parse(cleanJSON(jsonMatch[0]));
//       } catch (e3) {
//         console.error('Raw response:', text.substring(0, 500));
//         console.error('Parse error:', e2.message);
//         throw new Error(`Failed to parse JSON: ${e2.message}`);
//       }
//     }
//   }
// };

// /**
//  * Helper: Call Gemini API with retry logic
//  */
// const callGemini = async (prompt, maxTokens = 8000, retries = 3) => {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const result = await model.generateContent({
//         contents: [{ role: 'user', parts: [{ text: prompt }] }],
//         generationConfig: {
//           temperature: 0.3,
//           maxOutputTokens: maxTokens,
//           responseMimeType: 'application/json',
//         },
//       });

//       const response = await result.response;
//       const text = response.text();

//       // Validate it's parseable before returning
//       safeParseJSON(text);
//       return text;

//     } catch (error) {
//       console.error(`Gemini attempt ${i + 1} failed:`, error.message);
//       if (i === retries - 1) throw error;

//       // Wait before retry (1s, 2s, 3s)
//       await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
//     }
//   }
// };

// /**
//  * 4.2.3 - AI Course Generation
//  */
// const generateCourse = async ({ subject, difficulty, learningStyle, hoursPerWeek, priorKnowledge, specificGoals, targetWeeks }) => {
//   const prompt = `You are an expert educational curriculum designer. Create a comprehensive well-structured learning course.

// User Profile:
// - Subject: ${subject}
// - Difficulty Level: ${difficulty}
// - Learning Style: ${learningStyle}
// - Available Hours/Week: ${hoursPerWeek}
// - Prior Knowledge: ${priorKnowledge}
// - Specific Goals: ${specificGoals || 'General mastery'}
// - Target Duration: ${targetWeeks || 12} weeks

// Generate a complete course syllabus in this EXACT JSON format:
// {
//   "title": "Course title",
//   "description": "Course overview 2-3 sentences",
//   "estimatedTotalHours": 0,
//   "topics": [
//     {
//       "title": "Topic Title",
//       "description": "Topic overview",
//       "estimatedHours": 0,
//       "difficultyLevel": "beginner",
//       "order": 1,
//       "subtopics": [
//         {
//           "title": "Subtopic Title",
//           "description": "What will be learned",
//           "estimatedHours": 0,
//           "order": 1
//         }
//       ]
//     }
//   ],
//   "suggestedProjects": [
//     {
//       "title": "Project Title",
//       "description": "What to build",
//       "difficulty": "beginner",
//       "expectedOutcomes": ["outcome1", "outcome2"],
//       "technologies": ["tech1"],
//       "estimatedHours": 0
//     }
//   ]
// }

// Requirements:
// - Create 6-12 main topics with 3-5 subtopics each
// - Order topics by logical progression and dependencies
// - Adjust complexity to ${difficulty} level
// - Tailor content for ${learningStyle} learning style
// CRITICAL: Return ONLY a single valid JSON object. No comments, no trailing commas, no single quotes, no extra text.`;

//   const raw = await callGemini(prompt, 4000);
//   return safeParseJSON(raw);
// };

// /**
//  * 4.2.4 - Resource Recommendation Engine
//  */
// const generateResources = async ({ topicTitle, subtopicTitle, difficulty, learningStyle }) => {
//   const prompt = `You are a learning resource curator. Suggest the best learning resources for:
// Topic: ${topicTitle}
// Subtopic: ${subtopicTitle}
// Difficulty: ${difficulty}
// Learning Style: ${learningStyle}

// Return a JSON object with a resources array of 4-6 items in this EXACT format:
// {
//   "resources": [
//     {
//       "title": "Resource Title",
//       "url": "https://example.com",
//       "type": "video",
//       "platform": "YouTube",
//       "duration": "30 min",
//       "rating": 4.5,
//       "thumbnail": ""
//     }
//   ]
// }

// type must be one of: video, article, course, github, book
// platform must be one of: YouTube, Coursera, Udemy, Medium, GitHub, Other
// CRITICAL: Return ONLY a single valid JSON object. No comments, no trailing commas, no single quotes, no extra text.`;

//   const raw = await callGemini(prompt, 4000);
//   const parsed = safeParseJSON(raw);
//   return Array.isArray(parsed) ? parsed : parsed.resources || [];
// };

// /**
//  * 4.2.9 - Quiz and Assessment Generation
//  */
// const generateQuiz = async ({ topicTitle, subtopics, difficulty, questionCount = 10 }) => {
//   const prompt = `You are an expert educator creating an assessment quiz.

// Topic: ${topicTitle}
// Subtopics covered: ${subtopics.join(', ')}
// Difficulty: ${difficulty}
// Number of questions: ${questionCount}

// Generate a quiz in this EXACT JSON format:
// {
//   "title": "Quiz: ${topicTitle}",
//   "description": "Test your understanding of ${topicTitle}",
//   "questions": [
//     {
//       "questionText": "Question here?",
//       "type": "multiple_choice",
//       "options": ["A", "B", "C", "D"],
//       "correctAnswer": "A",
//       "explanation": "Why this is correct",
//       "difficulty": "easy",
//       "points": 1
//     }
//   ]
// }

// Rules:
// - Total ${questionCount} questions
// - Mix: 50% multiple_choice, 30% true_false, 20% short_answer
// - Difficulty spread: 30% easy, 50% medium, 20% hard
// - For true_false: options must be ["True", "False"]
// - For short_answer: options is empty array and correctAnswer is a key phrase
// CRITICAL: Return ONLY a single valid JSON object. No comments, no trailing commas, no single quotes, no extra text.`;

//   const raw = await callGemini(prompt, 4000);
//   return safeParseJSON(raw);
// };

// /**
//  * 4.2.8 - Adaptive Learning Suggestions
//  */
// const getAdaptiveSuggestion = async ({ userId, topicTitle, quizScore, timeSpent, difficulty }) => {
//   const prompt = `A learner is studying "${topicTitle}" at ${difficulty} difficulty.
// Quiz score: ${quizScore}%
// Time spent: ${timeSpent} minutes

// Analyze performance and return ONLY this JSON:
// {
//   "assessment": "on_track",
//   "recommendation": "Brief recommendation text here",
//   "adjustDifficulty": "maintain",
//   "additionalResources": ["resource suggestion 1", "resource suggestion 2"],
//   "studyTips": ["tip 1", "tip 2"]
// }

// assessment must be one of: struggling, on_track, excelling
// adjustDifficulty must be one of: increase, maintain, decrease
// CRITICAL: Return ONLY a single valid JSON object. No comments, no trailing commas, no single quotes, no extra text.`;

//   const raw = await callGemini(prompt, 4000);
//   return safeParseJSON(raw);
// };

// module.exports = { generateCourse, generateResources, generateQuiz, getAdaptiveSuggestion };

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateResourcesFromQueries } = require('../services/resourceService');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const primaryModelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const fallbackModelNames = (process.env.GEMINI_FALLBACK_MODELS || '')
  .split(',')
  .map((modelName) => modelName.trim())
  .filter(Boolean);
const candidateModelNames = [primaryModelName, ...fallbackModelNames];
const getModel = (modelName) => genAI.getGenerativeModel({ model: modelName });

/**
 * Clean AI response text before parsing
 */
const cleanJSON = (text) => {
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  let startIndex = -1;
  if (firstBrace === -1) startIndex = firstBracket;
  else if (firstBracket === -1) startIndex = firstBrace;
  else startIndex = Math.min(firstBrace, firstBracket);
  if (startIndex > 0) text = text.substring(startIndex);

  const lastBrace = text.lastIndexOf('}');
  const lastBracket = text.lastIndexOf(']');
  const endIndex = Math.max(lastBrace, lastBracket);
  if (endIndex !== -1) text = text.substring(0, endIndex + 1);

  text = text
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']')
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\\'/g, "'")
    .replace(/"\s*:\s*undefined/g, '": null');

  return text.trim();
};

/**
 * Safe JSON parser with 3 fallback attempts
 */
const safeParseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch (e1) {
    try {
      const cleaned = cleanJSON(text);
      return JSON.parse(cleaned);
    } catch (e2) {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(cleanJSON(jsonMatch[0]));
      } catch (e3) {
        console.error('Raw response (first 500):', text.substring(0, 500));
        console.error('Raw response (last 200):', text.substring(text.length - 200));
        console.error('Parse error:', e2.message);
        throw new Error(`Failed to parse JSON: ${e2.message}`);
      }
    }
  }
};

/**
 * Helper: Call Gemini API with retry logic
 * maxTokens raised to 8192 (flash model max safe output) to prevent truncation
 */
const isRetryableGeminiError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('503') ||
    message.includes('429') ||
    message.includes('service unavailable') ||
    message.includes('high demand') ||
    message.includes('temporarily unavailable') ||
    message.includes('timeout') ||
    message.includes('econnreset')
  );
};

const getBackoffDelayMs = (attempt) => {
  const base = Math.min(8000, 1000 * (2 ** attempt));
  const jitter = Math.floor(Math.random() * 300);
  return base + jitter;
};

const callGemini = async (prompt, maxTokens = 8192, retries = 3) => {
  let lastError;

  for (const modelName of candidateModelNames) {
    const model = getModel(modelName);

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: maxTokens,
            responseMimeType: 'application/json',
          },
        });

        const response = await result.response;

        // STOP is good; MAX_TOKENS means output was truncated.
        const candidate = response.candidates?.[0];
        if (candidate?.finishReason === 'MAX_TOKENS') {
          throw new Error('TRUNCATED');
        }

        const text = response.text();
        safeParseJSON(text); // validate parseable
        return text;
      } catch (error) {
        lastError = error;
        if (error?.message === 'TRUNCATED') throw error;

        const isRetryable = isRetryableGeminiError(error);
        const isLastAttemptOnModel = attempt === retries - 1;
        console.error(`Gemini model "${modelName}" attempt ${attempt + 1} failed:`, error.message);

        if (!isRetryable || isLastAttemptOnModel) break;

        const delayMs = getBackoffDelayMs(attempt);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Gemini call failed with unknown error');
};

/**
 * Helper: Call Gemini API for plain text responses (chat/Q&A).
 * Note: Do NOT force JSON mime type here.
 */
const callGeminiText = async (prompt, maxTokens = 1024, retries = 3) => {
  let lastError;

  for (const modelName of candidateModelNames) {
    const model = getModel(modelName);

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: maxTokens,
          },
        });

        const response = await result.response;

        const candidate = response.candidates?.[0];
        if (candidate?.finishReason === 'MAX_TOKENS') {
          throw new Error('TRUNCATED');
        }

        return response.text();
      } catch (error) {
        lastError = error;
        if (error?.message === 'TRUNCATED') break;

        const isRetryable = isRetryableGeminiError(error);
        const isLastAttemptOnModel = attempt === retries - 1;
        console.error(`Gemini (text) model "${modelName}" attempt ${attempt + 1} failed:`, error.message);

        if (!isRetryable || isLastAttemptOnModel) break;

        const delayMs = getBackoffDelayMs(attempt);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Gemini text call failed with unknown error');
};

/**
 * 4.2.3 - AI Course Generation
 * FIX: Split into two calls — skeleton first, then enrich topics separately.
 * This prevents the single-call response from being truncated at ~11k chars.
 */
const generateCourse = async ({ subject, difficulty, learningStyle, hoursPerWeek, priorKnowledge, specificGoals, targetWeeks }) => {

  // Step 1: Generate course structure with FEWER topics per call to stay within token limits
  const structurePrompt = `You are an expert educational curriculum designer.

User Profile:
- Subject: ${subject}
- Difficulty Level: ${difficulty}
- Learning Style: ${learningStyle}
- Available Hours/Week: ${hoursPerWeek}
- Prior Knowledge: ${priorKnowledge}
- Specific Goals: ${specificGoals || 'General mastery'}
- Target Duration: ${targetWeeks || 12} weeks

Generate a course with EXACTLY 6 to 8 main topics (not more — this is critical to fit in the response).
Each topic must have EXACTLY 3 subtopics (not more).

Return this EXACT JSON structure:
{
  "title": "Course title",
  "description": "Course overview in 2 sentences maximum",
  "estimatedTotalHours": 48,
  "topics": [
    {
      "title": "Topic Title",
      "description": "One sentence overview",
      "estimatedHours": 6,
      "difficultyLevel": "beginner",
      "order": 1,
      "subtopics": [
        {
          "title": "Subtopic Title",
          "description": "One sentence description",
          "estimatedHours": 2,
          "order": 1
        },
        {
          "title": "Subtopic Title",
          "description": "One sentence description",
          "estimatedHours": 2,
          "order": 2
        },
        {
          "title": "Subtopic Title",
          "description": "One sentence description",
          "estimatedHours": 2,
          "order": 3
        }
      ]
    }
  ],
  "suggestedProjects": [
    {
      "title": "Project Title",
      "description": "What to build in one sentence",
      "difficulty": "beginner",
      "expectedOutcomes": ["outcome1", "outcome2"],
      "technologies": ["tech1"],
      "estimatedHours": 10
    }
  ]
}

STRICT RULES:
- Maximum 8 topics
- Exactly 3 subtopics per topic
- Maximum 2 suggested projects
- All strings under 120 characters
- RETURN ONLY VALID JSON. No markdown, no code blocks, no comments, no trailing commas.`;

  try {
    const raw = await callGemini(structurePrompt, 8192);
    return safeParseJSON(raw);
  } catch (err) {
    if (err.message === 'TRUNCATED') {
      // Fallback: generate a minimal course that definitely fits
      return generateCourseFallback({ subject, difficulty, learningStyle, hoursPerWeek, priorKnowledge, specificGoals, targetWeeks });
    }
    throw err;
  }
};

/**
 * Fallback: generate a minimal 4-topic course when full generation truncates
 */
const generateCourseFallback = async ({ subject, difficulty, learningStyle, hoursPerWeek, priorKnowledge, specificGoals, targetWeeks }) => {
  const prompt = `Create a minimal learning course for: ${subject} (${difficulty} level).

Return ONLY this JSON with EXACTLY 4 topics, each with EXACTLY 2 subtopics:
{
  "title": "Learning ${subject}",
  "description": "A focused course to learn ${subject} from ${difficulty} level.",
  "estimatedTotalHours": ${(targetWeeks || 8) * Math.min(hoursPerWeek, 10)},
  "topics": [
    {
      "title": "Topic 1 title",
      "description": "Brief description",
      "estimatedHours": 4,
      "difficultyLevel": "${difficulty}",
      "order": 1,
      "subtopics": [
        { "title": "Subtopic 1", "description": "Description", "estimatedHours": 2, "order": 1 },
        { "title": "Subtopic 2", "description": "Description", "estimatedHours": 2, "order": 2 }
      ]
    }
  ],
  "suggestedProjects": [
    {
      "title": "Practice Project",
      "description": "Apply what you learned in ${subject}",
      "difficulty": "${difficulty}",
      "expectedOutcomes": ["Hands-on experience"],
      "technologies": ["${subject}"],
      "estimatedHours": 8
    }
  ]
}

Generate 4 real topics appropriate for ${subject} at ${difficulty} level.
RETURN ONLY VALID JSON. No markdown. No extra text.`;

  const raw = await callGemini(prompt, 4096);
  return safeParseJSON(raw);
};

/**
 * 4.2.4 - Resource Recommendation Engine
 */
const buildResourceQueryPrompt = ({ topicTitle, subtopicTitle, difficulty, learningStyle, adaptiveCue }) => {
  const cue = String(adaptiveCue || '').trim();
  return `You are a learning resource query planner.
Your job is to generate SEARCH QUERIES only. Never output URLs.

Input:
- Topic: ${topicTitle}
- Subtopic: ${subtopicTitle}
- Difficulty: ${difficulty}
- Learning Style: ${learningStyle}
${cue ? `\nPersonalization (follow closely):\n${cue}\n` : ''}
Return ONLY valid JSON in this exact shape:
{
  "queries": [
    {
      "query": "string",
      "intent": "video_tutorial|official_docs|practice_project|deep_dive",
      "resourceType": "video|article|course|github"
    }
  ]
}

STRICT RULES:
- Exactly 4 query objects
- query must be under 120 chars
- query must not include URL, domain, or protocol
- prioritize high-signal educational keywords
- RETURN ONLY VALID JSON`;
};

const generateResourceQueries = async ({ topicTitle, subtopicTitle, difficulty, learningStyle, adaptiveCue }) => {
  const prompt = buildResourceQueryPrompt({ topicTitle, subtopicTitle, difficulty, learningStyle, adaptiveCue });
  const raw = await callGemini(prompt, 1024);
  const parsed = safeParseJSON(raw);

  const queries = Array.isArray(parsed?.queries) ? parsed.queries : [];
  return {
    queries: queries
      .map((entry) => ({
        query: String(entry?.query || '').trim(),
        intent: String(entry?.intent || 'video_tutorial').trim(),
        resourceType: String(entry?.resourceType || 'video').trim(),
      }))
      .filter((entry) => entry.query),
  };
};

const generateResources = async ({
  topicTitle,
  subtopicTitle,
  difficulty,
  learningStyle,
  expectedMinutes,
  adaptiveCue,
  adaptiveResourceNuance,
}) => {
  let queryPlan;
  const nuance = adaptiveResourceNuance || 'core';
  try {
    queryPlan = await generateResourceQueries({
      topicTitle,
      subtopicTitle,
      difficulty,
      learningStyle,
      adaptiveCue,
    });
  } catch (error) {
    console.error('[aiService] Failed to generate search queries, using deterministic fallback:', error.message);
    const gentle = nuance === 'remedial' ? 'for beginners step by step ' : '';
    const deep = nuance === 'stretch' ? 'advanced in depth ' : '';
    queryPlan = {
      queries: [
        { query: `${gentle}${deep}${topicTitle} ${subtopicTitle} full tutorial ${difficulty}`.trim(), intent: 'video_tutorial', resourceType: 'video' },
        { query: `${gentle}${topicTitle} ${subtopicTitle} explained practice`.trim(), intent: 'practice_project', resourceType: 'video' },
      ],
    };
  }

  const result = await generateResourcesFromQueries({
    queryPlan,
    maxResources: 4,
    topicTitle,
    subtopicTitle,
    expectedMinutes,
  });

  return result.resources;
};

/**
 * 4.2.9 - Quiz and Assessment Generation
 */
const generateQuiz = async ({ topicTitle, subtopics, difficulty, questionCount = 10 }) => {
  // Cap question count to prevent truncation
  const safeCount = Math.min(questionCount, 8);

  const prompt = `Create a quiz with EXACTLY ${safeCount} questions for:
Topic: ${topicTitle}
Subtopics: ${subtopics.slice(0, 3).join(', ')}
Difficulty: ${difficulty}

Return ONLY this JSON:
{
  "title": "Quiz: ${topicTitle}",
  "description": "Test your understanding of ${topicTitle}",
  "questions": [
    {
      "questionText": "Question here?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation under 100 chars",
      "difficulty": "easy",
      "points": 1
    }
  ]
}

STRICT RULES:
- Exactly ${safeCount} questions total
- Mix: 60% multiple_choice, 40% true_false
- For true_false: options must be exactly ["True", "False"]
- For multiple_choice: exactly 4 options
- correctAnswer must exactly match one of the options
- All strings under 150 characters
- difficulty per question: one of easy, medium, hard
RETURN ONLY VALID JSON. No markdown, no code blocks, no trailing commas.`;

  const raw = await callGemini(prompt, 4096);
  return safeParseJSON(raw);
};

/**
 * 4.2.8 - Adaptive Learning Suggestions (Gemini narrative + structured assessment)
 */
const getAdaptiveSuggestion = async ({
  userId,
  topicTitle,
  quizScore,
  timeSpentMinutes,
  difficulty,
  adaptiveSnapshot,
}) => {
  const snap = adaptiveSnapshot && typeof adaptiveSnapshot === 'object' ? adaptiveSnapshot : {};
  const snapLine = [
    snap.resourceNuance && `Resource focus: ${snap.resourceNuance}`,
    snap.paceHint && `Pace hint: ${snap.paceHint}`,
    snap.effectiveQuizDifficulty && `Suggested next quiz difficulty: ${snap.effectiveQuizDifficulty}`,
    snap.engagementLevel && `Engagement: ${snap.engagementLevel}`,
  ].filter(Boolean).join(' | ');

  const prompt = `A learner is studying "${topicTitle}" at ${difficulty} difficulty.
Quiz score: ${quizScore}%
Time spent on quiz: ${Number(timeSpentMinutes).toFixed(1)} minutes
${snapLine ? `System adaptive profile: ${snapLine}\n` : ''}

Return ONLY this JSON:
{
  "assessment": "on_track",
  "recommendation": "One sentence recommendation under 160 chars",
  "adjustDifficulty": "maintain",
  "additionalResources": ["resource suggestion 1", "resource suggestion 2"],
  "studyTips": ["tip 1", "tip 2"]
}

assessment must be one of: struggling, on_track, excelling
adjustDifficulty must be one of: increase, maintain, decrease — align with whether they need easier or harder material next.
RETURN ONLY VALID JSON. No markdown, no code blocks, no trailing commas.`;

  const raw = await callGemini(prompt, 1024);
  return safeParseJSON(raw);
};

/**
 * Chat/Q&A: Answer user's doubt about a course.
 */
const answerCourseDoubt = async ({ course, messages }) => {
  const safeMessages = Array.isArray(messages) ? messages : [];
  const trimmed = safeMessages
    .map((m) => ({
      role: m?.role === 'assistant' ? 'assistant' : 'user',
      content: String(m?.content || '').trim(),
    }))
    .filter((m) => m.content)
    .slice(-12);

  const outline = (course?.topics || [])
    .slice(0, 12)
    .map((t, idx) => {
      const subs = (t?.subtopics || []).slice(0, 6).map((s) => s?.title).filter(Boolean);
      return `${idx + 1}. ${t?.title || 'Topic'}${subs.length ? ` (subtopics: ${subs.join(', ')})` : ''}`;
    })
    .join('\n');

  const transcript = trimmed.map((m) => `${m.role === 'assistant' ? 'Tutor' : 'Student'}: ${m.content}`).join('\n');

  const prompt = `You are a friendly, concise tutor helping a student understand their course.

Course:
- Title: ${course?.title || 'Untitled'}
- Description: ${course?.description || ''}
- Outline:
${outline || '(No outline)'}

Conversation so far:
${transcript || '(none)'}

Rules:
- Answer ONLY the student's last question.
- Keep it short and practical (max ~10 lines).
- Use simple examples when helpful.
- If the question is unclear, ask 1 clarifying question.
- Do not mention being an AI model.

Tutor:`;

  const text = await callGeminiText(prompt, 900);
  return String(text || '').trim();
};

/**
 * Chat/Q&A: General assistant for the app (no course context).
 */
const answerGeneralDoubt = async ({ messages }) => {
  const safeMessages = Array.isArray(messages) ? messages : [];
  const trimmed = safeMessages
    .map((m) => ({
      role: m?.role === 'assistant' ? 'assistant' : 'user',
      content: String(m?.content || '').trim(),
    }))
    .filter((m) => m.content)
    .slice(-12);

  const transcript = trimmed.map((m) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`).join('\n');

  const prompt = `You are a helpful assistant inside a learning app called Visory.

Conversation so far:
${transcript || '(none)'}

Rules:
- Answer ONLY the user's last message.
- Be concise and practical.
- If the user asks for course-specific help but you don't have the course context, suggest opening a course page.
- Do not mention being an AI model.

Assistant:`;

  const text = await callGeminiText(prompt, 900);
  return String(text || '').trim();
};

module.exports = {
  generateCourse,
  generateResources,
  generateQuiz,
  getAdaptiveSuggestion,
  answerCourseDoubt,
  answerGeneralDoubt,
};