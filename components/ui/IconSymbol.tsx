import React from "react";
import { Ionicons } from "@expo/vector-icons";

type IconSymbolProps = {
  name: keyof typeof Ionicons.glyphMap; // ✅ Ensures valid icon names
  size?: number;
  color?: string;
};

export default function IconSymbol({ name, size = 24, color = "black" }: IconSymbolProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
