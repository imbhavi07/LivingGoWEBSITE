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
        'brand-bg': '#FDFBF7',
        'brand-dark': '#3E2723',
        'brand-green': '#6A7B4D',
        'brand-greenMuted': '#8C9970',
        // Legacy color aliases for backward compatibility
        linen: "#FDFBF7",
        ink: "#3E2723",
        moss: "#6A7B4D",
        muted: "#8C9970"
      },
      boxShadow: {
        soft: "0 8px 32px rgba(62, 39, 35, 0.08)",
        lift: "0 12px 40px rgba(62, 39, 35, 0.12)",
        'soft-lg': "0 16px 48px rgba(62, 39, 35, 0.1)",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "Nunito", "system-ui", "sans-serif"],
        display: ["var(--font-quicksand)", "Quicksand", "system-ui", "sans-serif"],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'spin-y': 'spinY 2.5s linear infinite',
        'marquee': 'marquee 12s linear infinite',
      },
      keyframes: {
        spinY: {
          'from': { transform: 'rotateY(0deg)' },
          'to': { transform: 'rotateY(360deg)' },
        },
        marquee: {
          'from': { transform: 'translateX(0%)' },
          'to': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;