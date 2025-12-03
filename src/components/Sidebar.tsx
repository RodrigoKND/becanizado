import { useState } from 'react';
import { Home, LogOut, Youtube, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import SelectMatter from './SelectMatter';

export default function Sidebar({ sidebarOpen }: { sidebarOpen: boolean }) {
  const { profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:w-64 xl:w-72 flex-shrink-0`}
    >
      {/* Botón hamburguesa para móviles */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card-bg text-primary"
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
        className={`fixed lg:sticky top-0 left-0 h-[100dvh] z-40 w-64 flex flex-col bg-card-bg transform transition-transform duration-300 ease-in-out border border-border-color ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* HEADER con Logo y Botón de Tema */}
        <div className="p-6 border-b border-border-color">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <img
                src="/LogoBecanizado.jpeg"
                alt="Becanizado"
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-primary">
                  Becanizado
                </h1>
                <p className="text-xs text-secondary">
                  {profile?.role === 'professor' ? 'Profesor' : 'Estudiante'}
                </p>
              </div>
            </div>
          </div>

          {/* Botón de Tema */}
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-primary ${isActive('/dashboard') ? 'bg-input-bg' : 'hover-bg'
                }`}
              onClick={() => setIsOpen(false)}
            >
              <Home size={20} />
              <span className="font-medium">Inicio</span>
            </Link>

            <Link
              to="/sobre-mi-canal-yt"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-primary ${isActive('/sobre-mi-canal-yt') ? 'bg-input-bg' : 'hover-bg'
                }`}
              onClick={() => setIsOpen(false)}
            >
              <Youtube size={20} />
              <span className="font-medium">Sobre mi canal YT</span>
            </Link>

            <SelectMatter />
          </div>
        </nav>

        <div className="p-4 border-t border-border-color">
          <div className="mb-4 p-3 rounded-lg bg-input-bg">
            <p className="text-md font-medium text-primary text-pretty">
              {profile?.full_name}
            </p>
            <p className="text-md text-secondary text-pretty">
              Rol: {profile?.role}
            </p>
            <p className="text-xs text-secondary text-pretty">
              {profile?.email}
            </p>
          </div>
          <button
            onClick={() => {
              signOut();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-primary hover-bg"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}