export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#fdf5f8",
          100: "#fbe7ef",
          200: "#f7cfdf",
          300: "#f0b0c8",
          400: "#e68eae",
          500: "#d96f95",
          600: "#c2577d",
        },
        powder: {
          50: "#f3f8fd",
          100: "#e3eefa",
          200: "#c9ddf3",
          300: "#a7c6ea",
          400: "#7fa9dc",
          600: "#4a78ad",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
