import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext'; // ← IMPORTAR
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AboutMeChannelYt from './components/AboutMeChannelYt';
import { CacheProvider } from './contexts/CacheContext';
import { Analytics } from "@vercel/analytics/react"

function AppContent() {
  const { loading } = useAuth();
  if (loading) {
    return (
      <section className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </section>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sobre-mi-canal-yt" element={<AboutMeChannelYt />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider> 
      <CacheProvider>
        <AuthProvider>
          <AppContent />
          <Analytics mode='production' />
        </AuthProvider>
      </CacheProvider>
    </ThemeProvider>
  );
}