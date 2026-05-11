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
          bg: "#020617",
          panel: "#07111f",
          panel2: "#0b1628",
          cyan: "#22d3ee",
          blue: "#3b82f6",
          emerald: "#34d399",
          amber: "#f59e0b",
          rose: "#fb7185",
        },
      },
      boxShadow: {
        glow: "0 0 45px rgba(34, 211, 238, 0.18)",
        "glow-blue": "0 0 45px rgba(59, 130, 246, 0.22)",
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
