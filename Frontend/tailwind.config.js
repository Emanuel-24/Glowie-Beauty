/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        glowe: {
          pink: '#FDE2E4',
          'pink-dark': '#F4ACB7',
          'pink-accent': '#FF758F',
          blue: '#E2ECE9',
          'blue-dark': '#99C1B9',
          'blue-accent': '#52B788',
          yellow: '#FFF1C5',
          'yellow-dark': '#FFE494',
          'yellow-accent': '#F59E0B',
          offwhite: '#FAF8F5',
          dark: '#2D2A2E',
          muted: '#78716C',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(244, 172, 183, 0.12)',
        'glass-hover': '0 14px 40px 0 rgba(244, 172, 183, 0.25)',
        soft: '0 10px 30px -5px rgba(120, 113, 108, 0.08)',
        glow: '0 0 25px rgba(244, 172, 183, 0.45)',
      },
    },
  },
  safelist: [
    'group-hover:text-glowe-pink-accent',
    'group-hover:text-glowe-blue-accent',
    'group-hover:text-amber-600',
    'group-hover:text-rose-500',
  ],
  plugins: [],
}
