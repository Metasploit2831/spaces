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
        mint: "#7ddfc2",
        amber: "#eac76d",
        coral: "#ff8c78",
      },
      boxShadow: {
        sidebar: "-18px 0 48px rgba(0,0,0,0.28)",
        glow: "0 0 0 1px rgba(125,223,194,0.35), 0 12px 36px rgba(125,223,194,0.12)",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Instrument Sans", "Manrope", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
