import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        augusta: {
          green: "#006241",
          gold: "#D4AF37",
          white: "#FFFFFF",
          "green-dark": "#004830",
          "green-light": "#008055",
          "gold-light": "#E5C158",
        },
      },
    },
  },
  plugins: [],
};
export default config;
