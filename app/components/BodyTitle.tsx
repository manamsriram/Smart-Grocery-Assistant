import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { getThemeColors } from "../../theme/colors";

type BodyTitleProps = {
  children: string;
  style?: TextStyle;
};

const BodyTitle = ({ children, style }: BodyTitleProps) => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  return <Text style={[styles.bodyTitle, { color: colors.text }, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  bodyTitle: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 8,
  },
});

export default BodyTitle;
