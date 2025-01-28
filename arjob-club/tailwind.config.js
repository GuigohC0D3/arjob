/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Ajuste para onde seus arquivos estão
  theme: {
    extend: {
      // Adicionando animações personalizadas
      animation: {
        "slide-in": "slideIn 1s ease-out", // Nome da animação e duração
      },
      keyframes: {
        slideIn: {
          "0%": {
            transform: "translateY(-20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
      },
    },
  },
  plugins: [],
};
