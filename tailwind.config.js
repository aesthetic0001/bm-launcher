/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}", "./welcome.html"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}

