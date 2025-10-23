/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#0B0F14',
        secondary: '#161B22',
        accent: '#184039',
        textTheme: '#FFFFFF',
        textPrimary: '#00FF88',
        textSecondary: '#A0A0A0',
      }
    },
  },
  plugins: [],
}