import { lazy, Suspense, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import './index.css'

const SharedLayout = lazy(() => import('./components/SharedLayout'))
const ShareplacePage = lazy(() => import('./shareplace/ShareplacePage'))
const DashboardPage = lazy(() => import('./dashboard/DashboardPage'))
const ProfilePage = lazy(() => import('./profile/ProfilePage'))
const LearnPage = lazy(() => import('./learn/LearnPage'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div className="h-full w-full bg-[#1e1e2e]" />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/learn" element={<SharedLayout><LearnPage /></SharedLayout>} />
          <Route path="/shareplace" element={<SharedLayout><ShareplacePage /></SharedLayout>} />
          <Route path="/dashboard" element={<SharedLayout><DashboardPage /></SharedLayout>} />
          <Route path="/profile" element={<SharedLayout><ProfilePage /></SharedLayout>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>
)
