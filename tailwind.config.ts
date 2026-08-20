import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#08080a",
          950: "#08080a",
          900: "#0d0d10",
          800: "#141417",
          700: "#1c1c20",
          600: "#28282d",
          500: "#3a3a41",
        },
        bone: {
          DEFAULT: "#f3efe8",
          100: "#faf8f4",
          200: "#f3efe8",
          300: "#e5dfd3",
          400: "#c9c0ac",
        },
        gold: {
          DEFAULT: "#b89258",
          muted: "#8f7448",
          bright: "#d4af6a",
        },
        signal: {
          amber: "#c97a3a",
          red: "#b3462c",
        },
        // Sampled from the Studio XO wordmark cards — the brand's true,
        // saturated crimson (distinct from `signal.red`, which stays a
        // muted functional color for cancelled/sold-out states). Used for
        // Room XO's darker, redder identity and deliberate energy accents
        // elsewhere (brief: "gold as the premium accent, red strategically
        // for energy").
        crimson: {
          DEFAULT: "#8a0f10",
          bright: "#c81e24",
          deep: "#4a0808",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      fontSize: {
        "display-1": ["clamp(3rem, 8vw, 7.5rem)", { lineHeight: "0.96", letterSpacing: "-0.02em" }],
        "display-2": ["clamp(2.25rem, 5.5vw, 4.75rem)", { lineHeight: "0.98", letterSpacing: "-0.015em" }],
        "display-3": ["clamp(1.75rem, 3.5vw, 2.75rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      maxWidth: {
        content: "1440px",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        marquee: "marquee 32s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      backgroundImage: {
        "grain-fade": "linear-gradient(180deg, rgba(8,8,10,0) 0%, rgba(8,8,10,0.92) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
