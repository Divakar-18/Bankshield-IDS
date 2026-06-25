/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        cyber: {
          bg: '#020617',
          surface: '#0f172a',
          card: 'rgba(15, 23, 42, 0.85)',
          border: '#1e293b',
          primary: '#0ea5e9',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          accent: '#6366f1',
        },
      },
      boxShadow: {
        'neon-blue': '0 0 15px rgba(14, 165, 233, 0.4)',
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.4)',
        'neon-red': '0 0 15px rgba(239, 68, 68, 0.4)',
        'soc-card': 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)',
      },
      keyframes: {
        'soc-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.85)' },
        },
      },
      animation: {
        'soc-pulse': 'soc-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
