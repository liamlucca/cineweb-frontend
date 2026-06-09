import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import AuthPage from './pages/AuthPage.tsx'
import UploadPage from './pages/UploadPage.tsx'
import MainNavbar from './components/MainNavbar.tsx'

function App() {
  return (
    <BrowserRouter>
      <MainNavbar username='Fulanito'/>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/subir" element={<UploadPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App