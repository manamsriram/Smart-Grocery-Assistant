import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

type BodyTitleProps = {
  children: string;
  style?: TextStyle;
};

const BodyTitle = ({ children, style }: BodyTitleProps) => {
  return <Text style={[styles.bodyTitle, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  bodyTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#202020",
    marginBottom: 8,
  },
});

export default BodyTitle;
