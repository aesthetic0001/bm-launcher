/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/pages/**/*.{html,js}"],
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
            transitionProperty: {
                'width': 'width',
                'height': 'height',
                'spacing': 'margin, padding',
            }
        },
    },
    plugins: [require("daisyui")],
}

