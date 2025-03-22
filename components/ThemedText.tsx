import React from "react";
import { Text, TextProps, TextStyle } from "react-native";

type ThemedTextProps = TextProps & {
  type?: keyof typeof fontStyle;
};

// ✅ Define fontStyle with explicit `TextStyle`
const fontStyle: Record<string, TextStyle> = {
  default: { fontSize: 16 },
  defaultSemiBold: { fontSize: 16, fontWeight: "600" },
  title: { fontSize: 24, fontWeight: "bold" },
  link: { color: "blue", textDecorationLine: "underline" },
};

export function ThemedText({ children, style, type = "default", ...props }: ThemedTextProps) {
  return (
    <Text style={[fontStyle[type] || fontStyle.default, style]} {...props}>
      {children}
    </Text>
  );
}
