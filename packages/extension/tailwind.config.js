/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08090b",
        panel: "#09090b",
        chrome: "#18181b",
        line: "#27272a",
      },
      boxShadow: {
        sidebar: "-18px 0 48px rgba(0,0,0,0.28)",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Instrument Sans", "Manrope", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
