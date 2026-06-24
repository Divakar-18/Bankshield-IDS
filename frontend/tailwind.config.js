/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#030712',
          card: 'rgba(17, 24, 39, 0.75)',
          border: '#1f2937',
          primary: '#0ea5e9',   // Neon Blue
          success: '#10b981',   // Cyber Green
          warning: '#f59e0b',   // Cyber Yellow
          danger: '#ef4444',    // Cyber Red
          accent: '#c084fc'     // Cyber Purple
        }
      },
      boxShadow: {
        'neon-blue': '0 0 15px rgba(14, 165, 233, 0.4)',
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.4)',
        'neon-red': '0 0 15px rgba(239, 68, 68, 0.4)'
      }
    },
  },
  plugins: [],
}
