import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import SearchPage from './pages/SearchPage'
import AuthPage from './pages/AuthPage.tsx'
import UploadPage from './pages/UploadPage.tsx'
import MainNavbar from './components/MainNavbar.tsx'

import ReportPage from './pages/ReportPage.tsx'


function App() {
  return (
    <BrowserRouter>
      <MainNavbar username='Fulanito'/>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/subir" element={<UploadPage />} />
        <Route path="/buscar" element={<SearchPage />} />
        <Route path="/reportar" element={<ReportPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App