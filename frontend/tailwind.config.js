/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rajdhani', 'sans-serif'],
        heading: ['Unbounded', 'sans-serif'],
        lore: ['Cinzel', 'serif'],
      },
      colors: {
        background: {
          DEFAULT: '#050505',
          paper: '#0A0A0A',
          subtle: '#121212',
        },
        primary: {
          DEFAULT: '#2E2EFE',
          foreground: '#FFFFFF',
        },
        fire: '#FF3B30',
        electric: '#FFD60A',
        storm: '#64D2FF',
        void: '#BF5AF2',
        earth: '#8B8B8B',
        water: '#007AFF',
        nature: '#30D158',
        light: '#FFFFFF',
        memory: '#2E2EFE',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
