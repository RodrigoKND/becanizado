import React, { useState } from 'react';
import { Home, BookOpen, LogOut, Youtube, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Botón hamburguesa para móviles */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ backgroundColor: '#3e4145', color: '#b7babe' }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para cerrar el sidebar en móviles */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-[100dvh] z-40
          w-64 flex flex-col bg-[#3e4145]
          transform transition-transform duration-300 ease-in-out border border-[#84888c]/50
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
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
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: '#787e86',
                color: '#b7babe',
              }}
              onClick={() => setIsOpen(false)}
            >
              <Home size={20} />
              <span className="font-medium">Inicio</span>
            </a>

            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              style={{ color: '#b7babe' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#84888c')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              onClick={() => setIsOpen(false)}
            >
              <Youtube size={20} />
              <span className="font-medium">Sobre mi canal YT</span>
            </a>
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
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#84888c')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}