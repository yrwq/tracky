
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.rs",
    "./index.html",
    "./src/**/*.html",
    "./src/**/*.css",
    "./src/style.css"
  ],  
  theme: {
    extend: {
      colors: {
        gruvdark: {
          background: "#1d2021",
          foreground: "#d4be98",
        },
      },
    },
  }, plugins: [],
}

