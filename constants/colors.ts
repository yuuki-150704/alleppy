// Alleppy Design System
// Healthcare App palette: Teal (trust/safety) + Green (safe) + Red (danger)
// Recommended by ui-ux-pro-max: Medical Clinic / Healthcare App palette

export const Colors = {
  // Brand — teal conveys trust, safety, medical reliability
  brand: "#0891B2",
  brandLight: "#22D3EE",
  brandSoft: "rgba(8, 145, 178, 0.08)",
  brandMuted: "rgba(8, 145, 178, 0.15)",

  // Semantic — clear, immediate meaning
  safe: "#059669",
  safeSoft: "rgba(5, 150, 105, 0.07)",
  safeMuted: "rgba(5, 150, 105, 0.14)",
  safeText: "#065F46",

  danger: "#DC2626",
  dangerSoft: "rgba(220, 38, 38, 0.06)",
  dangerMuted: "rgba(220, 38, 38, 0.12)",
  dangerText: "#991B1B",

  warning: "#D97706",
  warningSoft: "rgba(217, 119, 6, 0.08)",

  // Surfaces
  background: "#F8FAFB",
  surface: "#FFFFFF",
  surfaceSecondary: "#F1F5F9",

  // Text — high contrast for readability (WCAG AAA)
  text: "#0F172A",
  textSecondary: "#475569",
  textTertiary: "#94A3B8",
  textInverse: "#FFFFFF",

  // Borders
  separator: "#E2E8F0",
  separatorLight: "#F1F5F9",

  // Tab
  tabActive: "#0891B2",
  tabInactive: "#94A3B8",
};

export const Shadows = {
  small: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
} as const;
