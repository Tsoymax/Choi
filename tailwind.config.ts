import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./styles/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18201d",
        leaf: "#4e7d5c",
        mist: "#eef5f0",
        coral: "#e66e57",
        honey: "#d69a3a"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(24, 32, 29, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
