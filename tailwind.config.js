/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Kanit', 'sans-serif'],
      },
      boxShadow: { soft:'0 8px 24px rgba(0,0,0,0.06)' }
    }
  },
  plugins: [],
};