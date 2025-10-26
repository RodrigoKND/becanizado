import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AboutMeChannelYt from './components/AboutMeChannelYt';

function AppContent() {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <section className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </section>
    );
  }
  
  if (!user || !profile) {
    return <Login />;
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
