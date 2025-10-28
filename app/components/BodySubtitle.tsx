import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

type BodySubtitleProps = {
  children: string;
  style?: TextStyle;
};

const BodySubtitle = ({ children, style }: BodySubtitleProps) => {
  return <Text style={[styles.bodySubtitle, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  bodySubtitle: {
    color: "#969696",
    fontSize: 17,
    marginBottom: 50,
  },
});

export default BodySubtitle;
