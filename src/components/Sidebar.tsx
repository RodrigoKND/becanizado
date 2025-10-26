import { useState } from 'react';
import { Home, LogOut, Youtube, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ sidebarOpen }: { sidebarOpen: boolean }) {
  const { profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const location = useLocation(); // Obtenemos la ruta actual

  // Función para verificar si la ruta coincide
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:w-64 xl:w-72 flex-shrink-0`}
    >
      {/* Botón hamburguesa para móviles */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ backgroundColor: '#3e4145', color: '#b7babe' }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:sticky top-0 left-0 h-[100dvh] z-40 w-64 flex flex-col bg-[#3e4145] transform transition-transform duration-300 ease-in-out border border-[#84888c]/50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b" style={{ borderColor: '#84888c' }}>
          <div className="flex items-center gap-3">
            <img
              src="/LogoBecanizado.jpeg"
              alt="Becanizado"
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#b7babe' }}>
                Becanizado
              </h1>
              <p className="text-xs" style={{ color: '#b7babe' }}>
                {profile?.role === 'professor' ? 'Profesor' : 'Estudiante'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-[#b7babe] hover:bg-[#84888c] ${
                isActive('/dashboard') ? 'bg-[#787e86]' : ''
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Home size={20} />
              <span className="font-medium">Inicio</span>
            </Link>

            <Link
              to="/sobre-mi-canal-yt"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-[#b7babe] hover:bg-[#84888c] ${
                isActive('/sobre-mi-canal-yt') ? 'bg-[#787e86]' : ''
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Youtube size={20} />
              <span className="font-medium">Sobre mi canal YT</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t" style={{ borderColor: '#84888c' }}>
          <div
            className="mb-4 p-3 rounded-lg"
            style={{ backgroundColor: '#787e86' }}
          >
            <p className="text-sm font-medium" style={{ color: '#b7babe' }}>
              {profile?.full_name}
            </p>
            <p className="text-xs" style={{ color: '#b7babe' }}>
              {profile?.email}
            </p>
          </div>
          <button
            onClick={() => {
              signOut();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{ color: '#b7babe' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#84888c')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
