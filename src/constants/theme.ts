// constants/theme.js — TripFusion React Native Design System

export const colors = {
  primary: "#0A1A44",
  secondary: "#1E3A5F",

  background: {
    default: "#f0f4f8",
    paper: "#ffffff",
    timeline: "#f9fafb",
  },

  surface: {
    card: "#ffffff",
    navbar: "rgba(255,255,255,0.4)",
    navbarSolid: "#ffffff",
    tabBar: "rgba(255,255,255,0.15)",
    tabBarBorder: "rgba(255,255,255,0.2)",
    tabIconInactive: "rgba(10,26,68,0.55)",
    tabIconActiveGlow: "rgba(13,148,136,0.2)",
  },

  text: {
    primary: "#0A1A44",
    secondary: "#4b5563",
    muted: "#9ca3af",
    light: "#ffffff",
    onDark: {
      subtitle: "rgba(255,255,255,0.7)",
      soft: "rgba(255,255,255,0.8)",
      muted: "rgba(255,255,255,0.6)",
      faint: "rgba(255,255,255,0.5)",
      placeholder: "rgba(255,255,255,0.4)",
    },
  },

  auth: {
    card: "rgba(255,255,255,0.08)",
    cardBorder: "rgba(255,255,255,0.15)",
    input: "rgba(255,255,255,0.1)",
    inputBorder: "rgba(255,255,255,0.2)",
    googleButton: "rgba(255,255,255,0.1)",
  },

  hero: {
    searchInput: "rgba(255,255,255,0.12)",
    searchInputBorder: "rgba(255,255,255,0.2)",
  },

  accent: {
    teal: "#0D9488",
    blue: "#4A90E2",
    blueHover: "#3a7ccc",
  },

  border: {
    light: "#f3f4f6",
    medium: "#e5e7eb",
    dark: "#d1d5db",
    highlight: "#99f6e4",
  },

  success: { light: "#d1fae5", main: "#10B981", dark: "#047857" },
  error: { light: "#fee2e2", main: "#EF4444", dark: "#B91C1C" },
  warning: { light: "#fef3c7", main: "#F59E0B", dark: "#D97706" },
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const borderRadius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
  huge: 40,
  full: 9999,
};

// React Native shadow system (replaces CSS box-shadow)
export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },
  cardGlowTeal: {
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGlowNavy: {
    shadowColor: "#0A1A44",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  floatingTeal: {
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
};

// Gradient configs for expo-linear-gradient
// Usage: <LinearGradient colors={gradients.tealAccent.colors} start={gradients.tealAccent.start} end={gradients.tealAccent.end} />
export const gradients = {
  tealAccent: {
    colors: ["#14b8a6", "#0d9488"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  brandDeep: {
    colors: ["#0A1A44", "#1E3A5F", "#0A1A44"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  navyOverlay: {
    colors: ["rgba(10,26,68,0.2)", "rgba(10,26,68,0.9)"],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  authMountain: {
    colors: [
      "rgba(10,26,68,0.2)",
      "rgba(10,26,68,0.3)",
      "rgba(10,26,68,0.95)",
    ],
    locations: [0, 0.4, 1] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  aboutVision: {
    colors: ["#0A1A44", "#115e59"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  packageCard: {
    colors: ["transparent", "rgba(10,26,68,0.95)"],
    start: { x: 0, y: 1 },
    end: { x: 0, y: 0 },
  },
};
