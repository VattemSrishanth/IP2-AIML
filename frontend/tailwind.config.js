/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0e1117',
          800: '#1c1f26',
          700: '#2e3136',
          600: '#40444b',
        },
        primary: '#00ff88',
        secondary: '#00d1ff',
        danger: '#ff4b4b',
        warning: '#f1c40f',
      }
    },
  },
  plugins: [],
}
