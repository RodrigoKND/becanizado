import { Plus, Search, Youtube } from 'lucide-react';
import { useState } from 'react';
import CreateExercise from './CreateExercise';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const { theme } = useTheme();

  return (
    <header
      className="min-h-24 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-0 border-b bg-card-bg border-border-color"
    >
      {/* Barra de búsqueda */}
      <div className="flex-1 w-full sm:max-w-2xl">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary"
            size={20}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por ejercicio o alumno..."
            className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-input-bg border-border-color text-primary"
            style={{
              caretColor: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Botón de YouTube */}
      <div className="flex justify-center my-4 gap-4">
        <a
          href="https://www.youtube.com/@BECANIZADO"
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-flex overflow-hidden rounded-full p-[1px]"
        >
          {/* Border animado */}
          <span className="absolute inset-[-1000%] [animation:border_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ff4c4c_0%,#cc0000_50%,#ff7f7f_100%)]"></span>

          {/* Contenido */}
          <span className="items-center justify-center w-full px-4 py-2 text-sm text-red-400 rounded-full cursor-pointer bg-card-bg backdrop-blur-3xl whitespace-nowrap flex gap-2 font-medium">
            <Youtube size={20} />
            Youtube
          </span>
        </a>
        <button
          type="button"
          aria-label='Crate an exercise'
          title='Crear un nuevo ejercicio'
          className='rounded-full p-4 border hidden lg:block'
          style={{
            backgroundColor: theme === 'light' ? '#f3f4f6' : '#3e4145',
            borderColor: theme === 'light' ? '#d1d5db' : '#fff',
            color: theme === 'light' ? '#1f2937' : '#b7babe'
          }}
          onClick={() => setShowCreateExercise(true)}
        >
          <Plus size={20} />
        </button>

        {
          showCreateExercise && (
            <CreateExercise onClose={() => setShowCreateExercise(false)} onSuccess={() => { }} />
          )
        }
      </div>
    </header>
  );
}