import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0c10",
        slate: "#151823",
        mist: "#c9d1d9",
        haze: "#9aa4b2",
        line: "#23283a",
        accent: "#6be4a5"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"]
      },
      boxShadow: {
        card: "0 8px 30px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
