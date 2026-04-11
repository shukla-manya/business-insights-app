import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme";

type Props = {
  /** Use on login gradient: no bar border, transparent background */
  blendWithGradient?: boolean;
};

export function AppFooter({ blendWithGradient }: Props) {
  return (
    <View style={[styles.wrap, blendWithGradient && styles.wrapGhost]}>
      <Text style={[styles.text, blendWithGradient && styles.textOnGradient]}>
        Made with love by Manya Shukla · 2026
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.bg,
  },
  wrapGhost: {
    borderTopWidth: 0,
    backgroundColor: "transparent",
    paddingBottom: spacing.md,
  },
  text: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
  textOnGradient: { opacity: 0.9 },
});
