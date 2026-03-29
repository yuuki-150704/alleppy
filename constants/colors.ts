export const Colors = {
  // Core palette — muted, sophisticated
  primary: "#1A1A1A",
  primarySoft: "#3A3A3A",
  accent: "#0A84FF",        // Apple blue
  accentSoft: "rgba(10, 132, 255, 0.08)",

  // Semantic — danger uses warm red, safe uses teal
  danger: "#FF3B30",
  dangerSoft: "rgba(255, 59, 48, 0.06)",
  dangerMuted: "rgba(255, 59, 48, 0.12)",
  safe: "#34C759",
  safeSoft: "rgba(52, 199, 89, 0.06)",
  safeMuted: "rgba(52, 199, 89, 0.12)",
  warning: "#FF9F0A",

  // Surfaces
  background: "#F5F5F7",    // Apple light gray
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfaceSecondary: "rgba(0, 0, 0, 0.03)",

  // Text
  text: "#1D1D1F",          // Apple dark
  textSecondary: "#86868B", // Apple secondary
  textTertiary: "#AEAEB2",
  textInverse: "#FFFFFF",

  // Borders & dividers
  separator: "rgba(0, 0, 0, 0.06)",
  separatorOpaque: "#E5E5EA",

  // Shadows
  shadowColor: "#000",

  // Tab bar
  tabActive: "#1D1D1F",
  tabInactive: "#AEAEB2",
};

export const Shadows = {
  small: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;
