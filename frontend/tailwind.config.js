/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Paleta vibrante kid-friendly
        primary: {
          DEFAULT: '#7C3AED', // roxo principal (identidade)
          light: '#A78BFA',
          dark: '#5B21B6',
        },
        secondary: {
          DEFAULT: '#22C55E', // verde brilhante (poupar/sucesso)
          light: '#86EFAC',
          dark: '#15803D',
        },
        accent: {
          DEFAULT: '#FBBF24', // amarelo ouro (conquistas)
          light: '#FDE68A',
          dark: '#B45309',
        },
        pink: {
          DEFAULT: '#EC4899', // rosa (diversão)
          light: '#F9A8D4',
        },
        cyan: {
          DEFAULT: '#06B6D4', // azul água (cool/transferência)
          light: '#67E8F9',
        },
        orange: {
          DEFAULT: '#FB923C', // laranja (alerta suave)
        },
        danger: {
          DEFAULT: '#EF4444', // vermelho (erros)
          light: '#FCA5A5',
        },
        background: '#FAF5FF', // lavanda clarinho (amigável)
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#1E1B4B', // indigo escuro (alto contraste)
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'Nunito', 'sans-serif'],
      },
      fontSize: {
        body: '16px',
        title: '26px',
        huge: '40px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};
