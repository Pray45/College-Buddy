/** @type {import('tailwindcss').Config} */
const colors = require("./src/config/colors");

module.exports = {
  content: ["./app.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary:        colors.primary,
        secondary:      colors.secondary,
        surface:        colors.surface,
        surfaceLight:   colors.surfaceLight,
        accent:         colors.accent,
        accentBright:   colors.accentBright,
        textTheme:      colors.textWhite,
        textPrimary:    colors.textPrimary,
        textLight:      colors.textLight,
        textSecondary:  colors.textSecondary,
        textMuted:      colors.textMuted,
        textDim:        colors.textDim,
        textDark:       colors.textDark,
        border:         colors.border,
        danger:         colors.danger,
        dangerMuted:    colors.dangerMuted,
        dangerText:     colors.dangerText,
        dangerLight:    colors.dangerLight,
        warning:        colors.warning,
        warningLight:   colors.warningLight,
        warningBorder:  colors.warningBorder,
        warningText:    colors.warningText,
        success:        colors.success,
        successMuted:   colors.successMuted,
        info:           colors.info,
        disabled:       colors.disabled,
        gradientFrom:   colors.gradientFrom,
        gradientTo:     colors.gradientTo,
      }
    },
  },
  plugins: [],
}