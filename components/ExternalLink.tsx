import React, { ReactNode } from "react";
import { Text, Linking, StyleSheet, TouchableOpacity } from "react-native";

type ExternalLinkProps = {
  url: string;
  children: ReactNode;
};

export function ExternalLink({ url, children }: ExternalLinkProps) {
  const openURL = () => Linking.openURL(url);

  return (
    <TouchableOpacity onPress={openURL}>
      <Text style={styles.link}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  link: { color: "blue", textDecorationLine: "underline" },
});
