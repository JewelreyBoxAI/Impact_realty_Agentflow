/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdff',
          100: '#ccfbff',
          200: '#99f6ff',
          300: '#5eecff',
          400: '#06d6f7',
          500: '#00FFFF',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        secondary: {
          500: '#00CED1',
        },
        background: {
          primary: '#0C0F1A',
          secondary: '#1a1f2e',
          tertiary: '#2a2f3e',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 5px #00FFFF',
          },
          '50%': {
            opacity: '.8',
            boxShadow: '0 0 20px #00FFFF, 0 0 30px #00FFFF',
          },
        },
      },
    },
  },
  plugins: [],
} 