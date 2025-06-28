/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html", // Pindai file HTML di folder public
    "./public/**/*.js",   // Jika ada JS yang menambahkan kelas Tailwind secara dinamis
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}