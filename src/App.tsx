import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import SearchPage from './pages/SearchPage'
import AuthPage from './pages/AuthPage.tsx'
import UploadPage from './pages/UploadPage.tsx'
import UploadSeriesPage from './pages/UploadSeriesPage.tsx'
import MainNavbar from './components/MainNavbar.tsx'
import Footer from './components/Footer.tsx'
import WatchPage from './pages/WatchPage.tsx'
import WatchSeriesPage from './pages/WatchSeriesPage.tsx'
import SeasonSelectPage from './pages/SeasonSelectPage.tsx'
import EpisodeListPage from './pages/EpisodeListPage.tsx'
import ReportPage from './pages/ReportPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import AdminPage from './pages/AdminPage.tsx'
import AppealPage from './pages/AppealPage.tsx'
import ModerationCasePage from './pages/ModerationCasePage.tsx'
import WatchLaterPage from './pages/WatchLaterPage.tsx'
import MyVideosPage from './pages/MyVideosPage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import useAuth from './hooks/useAuth.ts'

// a new page starts at the top, like a normal website (but "Back" keeps its own position)
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  const { user, logout } = useAuth()

  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* the footer stays at the bottom even on short pages */}
      <div className="min-h-screen flex flex-col">
        <MainNavbar user={user} onLogout={logout} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/watch/:id" element={<WatchPage />} />
            <Route path="/watch-series/:id/:seasonId/:episodeId" element={<WatchSeriesPage />} />
            <Route path="/series/:id/seasons" element={<SeasonSelectPage />} />
            <Route path="/series/:id/season/:seasonId/episodes" element={<EpisodeListPage />} />

            {/* viewer-only screens (sketches 3, 5, 7 and 8) */}
            <Route element={<ProtectedRoute allowedRoles={['viewer']} />}>
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/upload-series" element={<UploadSeriesPage />} />
              <Route path="/my-videos" element={<MyVideosPage />} />
              <Route path="/report/:type/:id" element={<ReportPage />} />
              <Route path="/appeal/:reportId" element={<AppealPage/>} />
              <Route path="/watch-later" element={<WatchLaterPage />} />
            </Route>

            {/* administrator-only screens (sketches A and B) */}
            <Route element={<ProtectedRoute allowedRoles={['administrator']} />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/reports/:id" element={<ModerationCasePage />} />
            </Route>

            {/* any logged-in user */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
