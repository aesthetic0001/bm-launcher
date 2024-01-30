/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js}", "./welcome.html"],
    theme: {
        extend: {
            colors: {
                redorange: '#e04848',
                white: '#d9d9d9',
                black: '#0d0d0d'
            },
            fontFamily: {
                'jetbrains': 'JetBrains Mono',
            },
        },
    },
    plugins: [require("daisyui")],
}

