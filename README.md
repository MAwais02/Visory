# AI Course Builder 

A full-stack MERN application that generates personalized AI-powered learning courses.

## Features (All 15 Requirements Covered)

| # | Requirement | Implementation |
|---|---|---|
| 4.2.1 | User Registration & Auth | JWT + Google OAuth via Passport.js |
| 4.2.2 | User Profile Setup | Onboarding wizard (goals, style, hours/week) |
| 4.2.3 | AI Course Generation | OpenAI GPT-4 → full syllabus with topics/subtopics |
| 4.2.4 | Resource Recommendation | AI suggests YouTube, Coursera, GitHub resources per topic |
| 4.2.5 | Timeline & Schedule | Auto date assignment based on hours/week |
| 4.2.6 | Visual Roadmap | Interactive topic roadmap on course detail page |
| 4.2.7 | Progress Tracking | Topics completed, time spent, study log |
| 4.2.8 | Adaptive Learning | AI analyzes quiz scores, adjusts recommendations |
| 4.2.9 | Quiz Generation | GPT-4 MCQ, True/False, Short Answer with grading |
| 4.2.10 | Project Suggestions | AI suggests practical projects per course |
| 4.2.11 | Bookmarks & Notes | Save resources with personal notes and tags |
| 4.2.12 | Notifications | Email (Nodemailer) + in-app, daily cron reminders |
| 4.2.13 | Course Regeneration | Regenerate or manually edit syllabus |
| 4.2.14 | Dashboard & Analytics | Recharts dashboards, streaks, time investment |
| 4.2.15 | Admin Panel | User management, system stats, course overview |

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Passport.js (Google OAuth), OpenAI SDK, Nodemailer, node-cron

**Frontend:** React 18, Vite, Tailwind CSS, React Query, Zustand, React Router v6, Recharts, React Hot Toast

## Project Structure

```
ai-course-builder/
├── backend/
│   ├── config/         passport.js (Google OAuth)
│   ├── middleware/      auth.js (JWT protect, adminOnly)
│   ├── models/          User, Course, Quiz, Progress, Notification
│   ├── routes/          auth, users, courses, quizzes, progress,
│   │                    resources, notifications, bookmarks, admin
│   ├── utils/           aiService.js (GPT-4), email.js (Nodemailer)
│   └── server.js        Express app entry point
│
└── frontend/
    └── src/
        ├── components/shared/  AppLayout (sidebar nav)
        ├── context/            authStore.js (Zustand)
        ├── pages/              All 13 pages
        └── utils/              api.js (Axios instance)
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in .env with your keys

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/ai-course-builder
JWT_SECRET=your_secret_here
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...        # Optional: for Google OAuth
GOOGLE_CLIENT_SECRET=...
EMAIL_USER=...              # Optional: for email notifications
EMAIL_PASS=...
CLIENT_URL=http://localhost:5173
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open: http://localhost:5173

### 4. Create Admin User

In MongoDB, update a user's role:
```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register with email/password |
| POST | /api/auth/login | Login, returns JWT |
| GET  | /api/auth/google | Google OAuth redirect |
| GET  | /api/users/me | Get current user |
| PUT  | /api/users/me/profile | Update profile |
| GET  | /api/courses | List user courses |
| POST | /api/courses/generate | AI course generation |
| GET  | /api/courses/:id | Get course details |
| PUT  | /api/courses/:id | Edit course |
| POST | /api/courses/:id/regenerate | Regenerate course |
| POST | /api/courses/:id/topics/:i/resources | Load AI resources |
| PATCH| /api/courses/:id/topics/:i/complete | Mark topic done |
| POST | /api/quizzes/generate | Generate quiz for topic |
| POST | /api/quizzes/:id/submit | Submit quiz answers |
| GET  | /api/progress/dashboard | Dashboard analytics |
| POST | /api/progress/log | Log study session |
| GET  | /api/bookmarks | List bookmarks |
| POST | /api/bookmarks | Create bookmark |
| GET  | /api/notifications | Get notifications |
| GET  | /api/admin/stats | Admin system stats |
| GET  | /api/admin/users | Admin user list |

## Deployment

**MongoDB Atlas** → update MONGODB_URI in .env

**Backend (Railway/Render):**
```bash
cd backend && npm start
```

**Frontend (Vercel/Netlify):**
```bash
cd frontend && npm run build
# Deploy /dist folder
```

---

MERN Stack + AI Integration
