/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#d6a84f',
          light: '#e5be6c',
          dark: '#a87927',
          deep: '#825c19'
        },
        obsidian: {
          950: '#040505',
          900: '#080a09',
          850: '#0d110f',
          800: '#121614',
          700: '#181f1b'
        },
        paper: '#f3f0e8',
        emerald: {
          glow: '#28d17c',
          deep: '#15803d'
        }
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' }
        }
      }
    },
  },
  plugins: [],
}
