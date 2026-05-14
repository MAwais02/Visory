import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './context/authStore'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import CourseResourcesPage from './pages/CourseResourcesPage'
import CourseRoadmapPage from './pages/CourseRoadmapPage'
import GenerateCoursePage from './pages/GenerateCoursePage'
import CourseRegeneratePage from './pages/CourseRegeneratePage'
import QuizPage from './pages/QuizPage'
import BookmarksPage from './pages/BookmarksPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import NotFoundPage from './pages/NotFoundPage'
import NotificationsPage from './pages/NotificationsPage'
import ContactPage from './pages/ContactPage'

// Layout
import AppLayout from './components/shared/AppLayout'
import CourseChatWidget from './components/course/CourseChatWidget'

const PrivateRoute = ({ children }) => {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const token = useAuthStore(s => s.token)
  return token ? <Navigate to="/dashboard" replace /> : children
}

const AdminRoute = ({ children }) => {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { token, fetchMe } = useAuthStore()

  useEffect(() => {
    if (token) fetchMe()
  }, [token])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Private — inside app layout */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/generate" element={<GenerateCoursePage />} />
          <Route path="/courses/:id/regenerate" element={<CourseRegeneratePage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/courses/:id/roadmap" element={<CourseRoadmapPage />} />
          <Route path="/courses/:id/topics/:topicIndex" element={<CourseResourcesPage />} />
          <Route path="/courses/:id/topics/:topicIndex/resources" element={<CourseResourcesPage />} />
          <Route path="/courses/:courseId/quiz/:quizId" element={<QuizPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Admin */}
        <Route element={<PrivateRoute><AdminRoute><AppLayout /></AdminRoute></PrivateRoute>}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <CourseChatWidget />
    </BrowserRouter>
  )
}