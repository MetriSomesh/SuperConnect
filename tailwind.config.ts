import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#121212",
        primary: "#a688fa",
        secondary: "#FBBF24",
        lightText: "#F3F4F6",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
