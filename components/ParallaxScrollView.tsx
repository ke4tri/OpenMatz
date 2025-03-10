import React, { ReactNode } from "react";
import { ScrollView, View, StyleSheet } from "react-native";

type ParallaxScrollViewProps = {
  children: ReactNode;
  headerBackgroundColor?: { light: string; dark: string }; // ✅ Added this
  headerImage?: ReactNode; // ✅ Added this
};

export default function ParallaxScrollView({ children, headerBackgroundColor, headerImage }: ParallaxScrollViewProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor?.light }]}>
        {headerImage}
      </View>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  header: { padding: 20, alignItems: "center", justifyContent: "center" },
  content: { padding: 20 },
});
