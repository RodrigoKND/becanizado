import React from 'react';
import { Search, Youtube } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header 
      className="min-h-16 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-0 border-b"
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
      <a
        href="https://www.youtube.com/@BECANIZADO"
        target="_blank"
        rel="noopener noreferrer"
        className="flex text-red-300 hover:bg-red-600 hover:text-white border border-red-300 items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
      >
        <Youtube size={20} />
        <span className="font-medium hidden xs:inline sm:inline">
          YouTube
        </span>
        <span className="font-medium xs:hidden sm:hidden">YT</span>
      </a>
    </header>
  );
}