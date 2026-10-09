import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import SearchPage from './pages/SearchPage'
import AuthPage from './pages/AuthPage.tsx'
import UploadPage from './pages/UploadPage.tsx'
import UploadSeriesPage from './pages/UploadSeriesPage.tsx'
import MainNavbar from './components/MainNavbar.tsx'
import WatchPage from './pages/WatchPage.tsx'
import WatchSeriesPage from './pages/WatchSeriesPage.tsx'
import SeasonSelectPage from './pages/SeasonSelectPage.tsx'
import EpisodeListPage from './pages/EpisodeListPage.tsx'
import ReportPage from './pages/ReportPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import AdminPage from './pages/AdminPage.tsx'
import AppealPage from './pages/AppealPage.tsx'
import MyVideosPage from './pages/MyVideosPage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import useAuth from './hooks/useAuth.ts'


function App() {
  const { user, logout } = useAuth()

  return (
    <BrowserRouter>
      <MainNavbar user={user} onLogout={logout} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/watch/:id" element={<WatchPage />} />
        <Route path="/watch-series/:id/:seasonId/:episodeId" element={<WatchSeriesPage />} />
        <Route path="/series/:id/seasons" element={<SeasonSelectPage />} />
        <Route path="/series/:id/season/:seasonId/episodes" element={<EpisodeListPage />} />

        {/* viewer-only screens (sketches 5, 7 and 8) */}
        <Route element={<ProtectedRoute allowedRoles={['viewer']} />}>
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/upload-series" element={<UploadSeriesPage />} />
          <Route path="/my-videos" element={<MyVideosPage />} />
          <Route path="/report/:type/:id" element={<ReportPage />} />
          <Route path="/appeal/:reportId" element={<AppealPage/>} />
        </Route>

        {/* administrator-only screens (sketches A and B) */}
        <Route element={<ProtectedRoute allowedRoles={['administrator']} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
