/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eu-blue': '#003399',
        'eu-blue-dark': '#003399',
        'eu-yellow': '#FFCC00',
        'pillar-bg': '#77BBFF',
        'pillar-title': '#001F5D',
        'map-bg': '#F2F6FB',
        'footer-bg': '#101828',
        'pillar-green': '#00A63E',
        'pillar-blue': '#155DFC',
        'pillar-purple': '#9810FA',
        'pillar-orange': '#E17100',
        'pillar-turq': '#00E1C7',
        'pillar-yellow': '#FFDB59',
        primary: '#1E40AF',
        secondary: '#0369A1',
      }
    },
  },
  plugins: [],
}
