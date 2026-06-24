import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import SearchPage from './pages/SearchPage'
import AuthPage from './pages/AuthPage.tsx'
import UploadPage from './pages/UploadPage.tsx'
import MainNavbar from './components/MainNavbar.tsx'

import ReportPage from './pages/ReportPage.tsx'
import ComplaintPage from './pages/ComplaintPage.tsx'
import ApelarPage from './pages/ApelarPage.tsx'


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
        <Route path="/denuncia" element={<ComplaintPage/>} />
        <Route path="/apelar" element={<ApelarPage/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App