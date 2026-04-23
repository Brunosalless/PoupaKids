/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#2E75B6',
        secondary: '#7ED957',
        accent: '#FFD166',
        danger: '#FF6B6B',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#1E293B',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Fredoka', 'sans-serif'],
      },
      fontSize: {
        body: '16px',
        title: '24px',
      },
    },
  },
  plugins: [],
};
