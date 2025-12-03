import { Search, Youtube } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header
      className="min-h-24 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 sm:py-0 border-b"
      style={{ backgroundColor: '#3e4145', borderColor: '#84888c' }}
    >
      {/* Barra de búsqueda */}
      <div className="flex-1 w-full sm:max-w-2xl">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            size={20}
            style={{ color: '#b7babe' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por ejercicio o alumno..."
            className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            style={{
              backgroundColor: '#787e86',
              borderColor: '#84888c',
              color: '#b7babe',
              caretColor: '#b7babe',
            }}
          />
        </div>
      </div>



      {/* Botón de YouTube */}
      <div className="flex justify-center my-4">
        <a
          href="https://www.youtube.com/@BECANIZADO"
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-flex overflow-hidden rounded-full p-[1px]"

        >
          {/* Border animado */}
          <span className="absolute inset-[-1000%] [animation:border_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ff4c4c_0%,#cc0000_50%,#ff7f7f_100%)]"></span>

          {/* Contenido */}
          <span className="inline-flex items-center justify-center w-full px-4 py-2 text-sm text-red-200 rounded-full cursor-pointer bg-[#3e4145] backdrop-blur-3xl whitespace-nowrap flex gap-2 font-medium"
          >
            <Youtube size={20} />
            Youtube
          </span>
        </a>
      </div>
    </header >
  );
}