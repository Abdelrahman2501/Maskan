/**
 * Maskan design tokens for mobile. Mirrors frontend/src/app/globals.css exactly
 * (specs/05-ui-ux-design-system.md §2). Screens must use these, never raw hex.
 */
export const colors = {
  navy: "#0B1F3A",
  navyDeep: "#07172B",
  navySecondary: "#163B66",
  accent: "#2D6CDF",
  white: "#FFFFFF",
  background: "#F5F7FB",
  surface: "#FFFFFF",
  border: "#DCE3ED",
  ink: "#172B45",
  inkMuted: "#66758A",
  success: "#16845B",
  warning: "#B7791F",
  error: "#C0393B",
  info: "#2D6CDF",
  /** Translucent overlays used on navy surfaces. */
  whiteA10: "rgba(255,255,255,0.10)",
  whiteA20: "rgba(255,255,255,0.20)",
  whiteA70: "rgba(255,255,255,0.70)",
  scrim: "rgba(7,23,43,0.55)",
} as const;

/** Tinted backgrounds for badges and alerts (≈10% of the semantic color on white). */
export const tints = {
  navy: "#E7EAEF",
  success: "#E8F3EF",
  warning: "#F8F2E9",
  error: "#F9EBEB",
  info: "#EAF0FC",
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 6, md: 10, lg: 16, xl: 24, pill: 999 } as const;

export const shadow = {
  card: {
    shadowColor: colors.navy,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  elevated: {
    shadowColor: colors.navy,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

export type ColorToken = keyof typeof colors;
