import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { toggleTheme } from '../../services/theme';

export const ThemeToggle: React.FC = () => {
  const theme = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      onClick={toggleTheme}
      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};
