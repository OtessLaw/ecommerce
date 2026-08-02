/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: '#0B0B0B',
          dark: '#141414',
          card: '#1A1A1A',
          gold: '#D4AF37',
          goldLight: '#F3E5AB',
          goldDark: '#9E7B3B',
          white: '#FFFFFF',
          gray: '#8E8E93',
          border: '#2A2A2A',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'Poppins', 'sans-serif'],
        display: ['Manrope', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 4px 25px -5px rgba(212, 175, 55, 0.25)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
};
