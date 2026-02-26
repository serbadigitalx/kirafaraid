/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['Amiri', 'serif'],
      },
      colors: {
        teal: {
          50: '#EDF9F9',
          100: '#D9F2F2',
          200: '#B0E2E2',
          300: '#7DCFCF',
          400: '#4DB8B8',
          500: '#2D9F9F',
          600: '#1A7A7A',
          700: '#14605F',
          800: '#0D4F4F',
          900: '#083B3B',
        },
        gold: {
          50: '#FDFAF0',
          100: '#FBF5E6',
          200: '#F5EBBD',
          300: '#F0DFA0',
          400: '#E5C76B',
          500: '#C8A951',
          600: '#A68A3E',
        },
        warm: {
          50: '#FAF8F5',
          100: '#F5F0EA',
          200: '#E8E2D9',
          300: '#D4CBC0',
          400: '#B8ADA1',
          500: '#9C9085',
          600: '#78716C',
          700: '#57534E',
          800: '#44403C',
          900: '#1C1917',
        },
      },
    },
  },
  plugins: [],
};
