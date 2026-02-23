const colors = {

    // ── Core backgrounds ──────────────────────
    primary:        "#0B0F14",     // deepest app background
    secondary:      "#161B22",     // cards, tab bar, header
    surface:        "#1C2128",     // elevated cards / inputs (dark)
    surfaceLight:   "#F3F4F6",     // input fields on light screens (auth)

    // ── Accent / brand ────────────────────────
    accent:         "#184039",     // brand green (muted)
    accentBright:   "#00FF88",     // brand green (vivid – badges, active states)

    // ── Text ──────────────────────────────────
    textWhite:      "#FFFFFF",     // primary text on dark bg
    textPrimary:    "#00FF88",     // highlighted / branded text
    textLight:      "#E5E7EB",     // near-white text (gray-200)
    textSecondary:  "#A0A0A0",     // muted / secondary
    textMuted:      "#9CA3AF",     // placeholder text, hints (gray-400)
    textDim:        "#6B7280",     // disabled / very muted (gray-500)
    textDark:       "#000000",     // text on light backgrounds

    // ── Borders / dividers ────────────────────
    border:         "#29313C",     // section dividers
    borderLight:    "rgba(255,255,255,0.10)",  // subtle white/10
    borderFaint:    "rgba(255,255,255,0.05)",  // very subtle white/5

    // ── Status: danger / error ────────────────
    danger:         "#EF4444",     // red-500 – destructive actions
    dangerMuted:    "rgba(239,68,68,0.20)",    // red bg tint
    dangerText:     "#F87171",     // red-400 – error text on dark
    dangerLight:    "#FEF2F2",     // red-50 – error bg on light

    // ── Status: warning ───────────────────────
    warning:        "#CA8A04",     // yellow-600
    warningLight:   "#FEF9C3",    // yellow-100 – warning bg
    warningBorder:  "#FACC15",    // yellow-400
    warningText:    "#854D0E",    // yellow-800

    // ── Status: success ───────────────────────
    success:        "#16A34A",     // green-600
    successMuted:   "rgba(0,255,136,0.20)",    // accentBright/20

    // ── Status: info / action ─────────────────
    info:           "#2563EB",     // blue-600

    // ── Overlay / glass ───────────────────────
    overlayLight:   "rgba(255,255,255,0.05)",  // bg-white/5
    overlayDark:    "rgba(0,0,0,0.25)",        // bg-black/25
    overlayDarker:  "rgba(0,0,0,0.30)",        // bg-black/30

    // ── Gradients ─────────────────────────────
    gradientFrom:   "#111827",     // gray-900
    gradientTo:     "#0F172A",     // slate-900

    // ── Shadows ───────────────────────────────
    shadow:         "rgba(0,0,0,0.40)",
    shadowLight:    "rgba(0,0,0,0.30)",

    // ── Disabled ──────────────────────────────
    disabled:       "#4B5563",     // gray-600
};

module.exports = colors;
