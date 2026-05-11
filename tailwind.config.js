/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Consolas", "monospace"],
      },
      colors: {
        trace: {
          bg: "#08030a",
          panel: "#120714",
          panel2: "#1b0a1f",
          pink: "#ec4899",
          fuchsia: "#c026d3",
          emerald: "#34d399",
          amber: "#f59e0b",
          rose: "#fb7185",
        },
      },
      boxShadow: {
        glow: "0 0 45px rgba(236, 72, 153, 0.22)",
        "glow-fuchsia": "0 0 45px rgba(192, 38, 211, 0.24)",
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "soft-pulse": "softPulse 3.5s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        softPulse: {
          "0%, 100%": { opacity: "0.65" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
      },
    },
  },
  plugins: [],
};
