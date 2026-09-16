import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import SearchPage from './pages/SearchPage'
import AuthPage from './pages/AuthPage.tsx'
import UploadPage from './pages/UploadPage.tsx'
import MainNavbar from './components/MainNavbar.tsx'
import WatchPage from './pages/WatchPage.tsx'
import WatchSeriesPage from './pages/WatchSeriesPage.tsx'
import SeasonSelectPage from './pages/SeasonSelectPage.tsx'
import EpisodeListPage from './pages/EpisodeListPage.tsx'
import ReportPage from './pages/ReportPage.tsx'
import ComplaintPage from './pages/ComplaintPage.tsx'
import AppealPage from './pages/AppealPage.tsx'
import MyVideosPage from './pages/MyVideosPage.tsx'


function App() {
  return (
    <BrowserRouter>
      <MainNavbar username='John Doe'/>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/complaint" element={<ComplaintPage/>} />
        <Route path="/appeal" element={<AppealPage/>} />
        <Route path="/watch/:id" element={<WatchPage />} />
        <Route path="/watch-series/:id/:seasonId/:episodeId" element={<WatchSeriesPage />} />
        <Route path="/series/:id/seasons" element={<SeasonSelectPage />} />
        <Route path="/series/:id/season/:seasonId/episodes" element={<EpisodeListPage />} />
        <Route path="/my-videos" element={<MyVideosPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
