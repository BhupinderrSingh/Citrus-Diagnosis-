/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': '#00ff88',
        'danger-red': '#ff3333',
        'dark-bg': '#0a0f0a',
        'panel-bg': 'rgba(20, 25, 20, 0.85)',
      }
    },
  },
  plugins: [],
}