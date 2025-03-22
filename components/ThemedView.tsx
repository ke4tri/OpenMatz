import React, { ReactNode } from "react";
import { View, ViewProps, StyleSheet } from "react-native";

type ThemedViewProps = ViewProps & {
  children: ReactNode;
};

export function ThemedView({ children, style, ...props }: ThemedViewProps) {
  return <View style={[styles.container, style]} {...props}>{children}</View>;
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", padding: 10, borderRadius: 8 },
});
