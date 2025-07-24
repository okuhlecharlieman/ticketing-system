'use client';

import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';  // Correct relative path (assuming same level as /components/)

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <button onClick={toggleDarkMode} className="p-2 bg-gray-200 dark:bg-gray-800 rounded">
      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}