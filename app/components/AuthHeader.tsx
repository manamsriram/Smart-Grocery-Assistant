import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { getThemeColors } from "../../theme/colors";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  backgroundColor?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  backgroundColor,
}) => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const bg = backgroundColor || colors.primary;
  return (
    <View style={[styles.header, { backgroundColor: bg }]}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerSubtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 65,
    paddingBottom: 30,
    paddingHorizontal: 24,
    minHeight: 160,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  headerSubtitle: {
    color: "#fff",
    fontSize: 17,
    lineHeight: 25,
  },
});

export default AuthHeader;
