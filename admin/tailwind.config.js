/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070909',
        surface: '#0d1010',
        card: '#121616',
        gold: {
          light: '#f3e5ab',
          DEFAULT: '#d4af37',
          dark: '#aa8c2c',
        },
        emerald: {
          glow: '#10b981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
