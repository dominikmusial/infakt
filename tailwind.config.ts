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
        infakt: {
          blue: "#0066cc",
          darkblue: "#004c99",
          navy: "#0a192f",
          light: "#f0f7ff",
          accent: "#00b4d8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
