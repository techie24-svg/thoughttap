import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        roseGlass: "rgba(255,255,255,0.72)",
      },
    },
  },
  plugins: [],
};
export default config;
