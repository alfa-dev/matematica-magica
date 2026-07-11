import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ceu: "#EAF6FF",
        ceunoite: "#1E2A5A",
        sol: "#FFC93C",
        coral: "#FF6B6B",
        grama: "#58C472",
        uva: "#7C5CE0",
        tinta: "#2B3A67",
      },
      fontFamily: {
        display: ["Fredoka", "sans-serif"],
        body: ["Nunito", "sans-serif"],
      },
      boxShadow: {
        candy: "0 6px 0 rgba(0,0,0,0.15)",
        candyPressed: "0 2px 0 rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
