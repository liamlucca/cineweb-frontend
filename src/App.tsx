import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import SearchPage from './pages/SearchPage'
import AuthPage from './pages/AuthPage.tsx'
import UploadPage from './pages/UploadPage.tsx'
import MainNavbar from './components/MainNavbar.tsx'
import WatchPage from './pages/WatchPage.tsx'
import WatchSeriesPage from './pages/WatchSeriesPage.tsx'
import SeriesListPage from './pages/SeriesListPage.tsx'
import SeasonSelectPage from './pages/SeasonSelectPage.tsx'
import EpisodeListPage from './pages/EpisodeListPage.tsx'
import ReportPage from './pages/ReportPage.tsx'
import ComplaintPage from './pages/ComplaintPage.tsx'
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
        <Route path="/series" element={<SeriesListPage />} />
        <Route path="/watch-series/:id/:seasonId/:episodeId" element={<WatchSeriesPage />} />
        <Route path="/series/:id/seasons" element={<SeasonSelectPage />} />
        <Route path="/series/:id/season/:seasonId/episodes" element={<EpisodeListPage />} />

        {/* viewer-only screens (sketches 5, 7 and 8) */}
        <Route element={<ProtectedRoute allowedRoles={['viewer']} />}>
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/my-videos" element={<MyVideosPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/complaint" element={<ComplaintPage/>} />
          <Route path="/appeal" element={<AppealPage/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
