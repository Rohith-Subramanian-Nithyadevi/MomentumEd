/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          100: '#EDF2FA', 
          200: '#D7E3FC',
          300: '#CCDBFD',
          400: '#C1D3FE',
          500: '#ABC4FF', 
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}