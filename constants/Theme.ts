const tint = "#db6e1a";
const accent = "#00b89f";
const glowDark = "#121212";
const glowLight = "#FFFFFF";

export const Colors = {
  light: {
    text: glowDark,
    background: glowLight,
    tint: tint,
    icon: "#A7A7A7",
    tabIconDefault: "#A7A7A7",
    tabIconSelected: tint,
    border: "#E0E0E0",
    accent: accent,
    success: "#2DD881",
    danger: "#FF2E63",
    muted: "#9A9A9A",
    tabBar: glowLight,
  },
  dark: {
    text: glowLight,
    background: glowDark,
    tint: tint,
    icon: "#7F7F7F",
    tabIconDefault: "#7F7F7F",
    tabIconSelected: tint,
    border: "#333333",
    accent: accent,
    success: "#2DD881",
    danger: "#FF2E63",
    muted: "#757575",
    tabBar: "#181818",
  },
};

export const Spacings = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BorderRadii = {
  sm: 8,
  md: 16,
  lg: 24,
};
