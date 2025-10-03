// components/ThemeToggle.tsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
        className="theme-toggle p-3 rounded-lg transition-all duration-200 hover:scale-105 relative group"
                            style={{
                                background: 'linear-gradient(135deg, #2D1F1F 0%, #3D2A2A 100%)',
                                color: '#C9A876',
                                border: '2px solid #8B6914',
                                boxShadow: 'inset 0 1px 0 #D4AF3720, 0 2px 4px #00000040'
                            }}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
};