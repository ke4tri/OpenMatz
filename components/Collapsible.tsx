import React, { useState, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type CollapsibleProps = {
  title: string;
  children: ReactNode;
};

export function Collapsible({ title, children }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  header: { backgroundColor: "#ddd", padding: 10 },
  title: { fontSize: 16, fontWeight: "bold" },
  content: { padding: 10, backgroundColor: "#f9f9f9" },
});
