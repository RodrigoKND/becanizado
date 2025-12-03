import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-lg transition-colors border"
      style={{
        backgroundColor: theme === 'light' ? '#f3f4f6' : '#3e4145',
        borderColor: theme === 'light' ? '#d1d5db' : '#84888c',
        color: theme === 'light' ? '#1f2937' : '#b7babe'
      }}
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
    >
      {theme === 'light' ? (
        <Moon size={20} />
      ) : (
        <Sun size={20} />
      )}
    </button>
  );
}