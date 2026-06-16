/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        cream: "#FFF6E5",
        creamdeep: "#FBEACC",
        tomato: "#E85A4F",
        tomatoDark: "#C8443B",
        cheese: "#F6B73C",
        cheeseLight: "#FFD984",
        basil: "#7CB342",
        basilDark: "#5E8F30",
        dough: "#8B6F47",
        doughDark: "#6B5236",
        sky: "#5B9BD5",
        plum: "#B07CC6",
        ink: "#3E2C23",
        inkSoft: "#6B5848",
        paper: "#FFFDF7",
      },
      fontFamily: {
        display: ['"Fredoka"', '"ZCOOL KuaiLe"', "system-ui", "sans-serif"],
        kid: ['"ZCOOL KuaiLe"', '"Fredoka"', "system-ui", "sans-serif"],
        body: ['"Noto Sans SC"', '"Fredoka"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        blob: "2rem",
      },
      boxShadow: {
        sticker: "0 6px 0 0 rgba(139,111,71,0.22), 0 10px 22px rgba(139,111,71,0.18)",
        stickerSm: "0 4px 0 0 rgba(139,111,71,0.22), 0 6px 14px rgba(139,111,71,0.16)",
        insetSoft: "inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -3px 6px rgba(139,111,71,0.12)",
        glow: "0 0 0 4px rgba(246,183,60,0.45), 0 0 28px rgba(246,183,60,0.55)",
      },
      backgroundImage: {
        paper: "radial-gradient(rgba(139,111,71,0.06) 1px, transparent 1px)",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.06)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shine: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        pop: "pop 0.35s cubic-bezier(0.22,1,0.36,1)",
        wiggle: "wiggle 0.5s ease-in-out",
        floaty: "floaty 3.5s ease-in-out infinite",
        shine: "shine 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
