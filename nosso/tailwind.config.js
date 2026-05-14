/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        prr: {
          blue: '#1B3A6B',
          green: '#2E7D32',
          orange: '#E65100',
          purple: '#6A1B9A',
          teal: '#00695C',
          gold: '#F9A825',
          light: '#F4F6FA',
          border: '#DDE3EE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}