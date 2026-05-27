import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        linen: "#FCF8F3",
        oat: "#EEE7DD",
        ink: "#573715",
        muted: "#746F68",
        clay: "#B8846F",
        moss: "#DEB178"
      },
      boxShadow: {
        soft: "0 18px 48px rgba(32, 32, 31, 0.08)",
        lift: "0 14px 32px rgba(32, 32, 31, 0.12)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
