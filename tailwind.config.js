/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',  // Enables dark mode via class (toggled in ThemeContext)
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',
      },
    },
  },
  plugins: [],
};