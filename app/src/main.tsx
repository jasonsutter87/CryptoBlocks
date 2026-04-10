import { lazy, Suspense, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import App from './App'
import './index.css'

// Configure Monaco workers for local bundling
self.MonacoEnvironment = {
  getWorker(_: unknown, label: string) {
    if (label === 'typescript' || label === 'javascript') return new tsWorker()
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
    return new editorWorker()
  },
}

// Use locally bundled Monaco instead of CDN
loader.config({ monaco })

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
