import { lazy, Suspense, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import './index.css'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string

// Wrapper that skips ClerkProvider when the key isn't set (local dev without .env.local)
function AuthWrapper({ children }: { children: React.ReactNode }) {
  if (!CLERK_KEY) {
    return <>{children}</>
  }
  return (
    <ClerkProvider publishableKey={CLERK_KEY} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  )
}

const SharedLayout = lazy(() => import('./components/SharedLayout'))
const ShareplacePage = lazy(() => import('./shareplace/ShareplacePage'))
const DashboardPage = lazy(() => import('./dashboard/DashboardPage'))
const ProfilePage = lazy(() => import('./profile/ProfilePage'))
const LearnPage = lazy(() => import('./learn/LearnPage'))
const CollabPage = lazy(() => import('./collab/CollabPage'))
const DailyChallengePage = lazy(() => import('./daily/DailyChallengePage'))
const TeacherDashboard = lazy(() => import('./teacher/TeacherDashboard'))
const LeaderboardPage = lazy(() => import('./leaderboard/LeaderboardPage'))
const SharedProjectLoader = lazy(() => import('./shareplace/SharedProjectLoader'))
const AdminPage = lazy(() => import('./admin/AdminPage'))
const ExampleLoader = lazy(() => import('./examples/ExampleLoader'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthWrapper>
      <BrowserRouter>
        <Suspense fallback={<div className="h-full w-full bg-base" />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/collab/:roomCode" element={<CollabPage />} />
            <Route path="/learn" element={<SharedLayout><LearnPage /></SharedLayout>} />
            <Route path="/shareplace" element={<SharedLayout><ShareplacePage /></SharedLayout>} />
            <Route path="/dashboard" element={<SharedLayout><DashboardPage /></SharedLayout>} />
            <Route path="/profile" element={<SharedLayout><ProfilePage /></SharedLayout>} />
            <Route path="/daily" element={<SharedLayout><DailyChallengePage /></SharedLayout>} />
          <Route path="/teacher" element={<SharedLayout><TeacherDashboard /></SharedLayout>} />
          <Route path="/leaderboard" element={<SharedLayout><LeaderboardPage /></SharedLayout>} />
          <Route path="/project/:id" element={<SharedProjectLoader />} />
          <Route path="/example/:id" element={<ExampleLoader />} />
          <Route path="/admin" element={<SharedLayout><AdminPage /></SharedLayout>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthWrapper>
  </StrictMode>
)
