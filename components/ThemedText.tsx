import React from "react";
import { Text, TextProps } from "react-native";

type ThemedTextProps = TextProps & {
  type?: "default" | "defaultSemiBold" | "title" | "link";
};

export function ThemedText({ children, style, type = "default", ...props }: ThemedTextProps) {
  const fontStyle = {
    default: { fontSize: 16 },
    defaultSemiBold: { fontSize: 16, fontWeight: "600" },
    title: { fontSize: 24, fontWeight: "bold" },
    link: { color: "blue", textDecorationLine: "underline" },
  };

  return (
    <Text style={[fontStyle[type], style]} {...props}>
      {children}
    </Text>
  );
}
