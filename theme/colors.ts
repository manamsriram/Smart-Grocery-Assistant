export const lightTheme = {
  background: "#ffffff",
  surface: "#f6f6f6",
  text: "#222222",
  textSecondary: "#707070",
  border: "#e0e0e0",
  primary: "#36AF27",
  card: "#ffffff",
  overlay: "rgba(32,32,32,0.4)",
};

export const darkTheme = {
  background: "#1a1a1a",
  surface: "#2d2d2d",
  text: "#ffffff",
  textSecondary: "#b0b0b0",
  border: "#404040",
  primary: "#36AF27",
  card: "#333333",
  overlay: "rgba(0,0,0,0.6)",
};

export type ThemeColors = typeof lightTheme;

export const getThemeColors = (isDark: boolean): ThemeColors => {
  return isDark ? darkTheme : lightTheme;
};
