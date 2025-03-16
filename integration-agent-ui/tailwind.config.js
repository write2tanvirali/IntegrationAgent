/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // Add any other files that contain Tailwind classes
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4dabf5',
          main: '#1976d2',
          dark: '#1565c0',
        },
        secondary: {
          light: '#ff4081',
          main: '#dc004e',
          dark: '#c51162',
        },
      },
      boxShadow: {
        'task': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'task-hover': '0 4px 8px rgba(0, 0, 0, 0.15)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'slideIn': 'slideIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'grid-slate-100': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Cg fill=\'%23e2e8f0\' fill-opacity=\'0.4\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M0 0h20v20H0V0zm1 1h18v18H1V1z\'/%3E%3C/g%3E%3C/svg%3E")',
        'grid-pattern': 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '20px 20px',
      },
    },
  },
  plugins: [],
} 