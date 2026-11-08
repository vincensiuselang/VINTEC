/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./*.tsx", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        // jalur gerak tiap logo diatur lewat --dx / --dy / --r (lihat TechBackground.tsx)
        drift: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "25%": { transform: "translate(var(--dx), calc(var(--dy) * -0.6)) rotate(var(--r))" },
          "50%": { transform: "translate(calc(var(--dx) * 0.3), calc(var(--dy) * -1)) rotate(0deg)" },
          "75%": {
            transform: "translate(calc(var(--dx) * -0.7), calc(var(--dy) * -0.4)) rotate(calc(var(--r) * -1))",
          },
        },
      },
      animation: {
        drift: "drift 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
