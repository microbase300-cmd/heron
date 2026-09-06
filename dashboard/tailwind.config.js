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
          DEFAULT: '#F0B90B',
          light: '#FCD535',
          dark: '#C99400',
          deep: '#825C00',
          glow: 'rgba(240, 185, 11, 0.15)'
        },
        obsidian: {
          950: '#121418',
          900: '#181A20',
          850: '#1E2329',
          800: '#2B313A',
          700: '#363D47',
          600: '#474D57'
        },
        binance: {
          bg: '#181A20',
          card: '#1E2329',
          elevated: '#2B313A',
          border: '#2B313A',
          borderLight: '#474D57',
          yellow: '#F0B90B',
          yellowHover: '#FCD535',
          green: '#0ECB81',
          red: '#F6465D',
          textPrimary: '#EAECEF',
          textSecondary: '#848E9C',
          textMuted: '#5E6673'
        },
        paper: '#EAECEF',
        emerald: {
          DEFAULT: '#0ECB81',
          glow: '#0ECB81',
          deep: '#03A66D'
        },
        rose: {
          DEFAULT: '#F6465D',
          glow: '#F6465D',
          deep: '#CF304A'
        }
      },
      fontFamily: {
        sans: ['Inter', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
        display: ['Inter', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        editorial: ['"Playfair Display"', 'Georgia', 'serif']
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'ticker': 'ticker 35s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' }
        },
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      }
    },
  },
  plugins: [],
}
