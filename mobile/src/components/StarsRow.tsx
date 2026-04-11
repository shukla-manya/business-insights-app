import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";

type Props = { rating: number; size?: number };

export function StarsRow({ rating, size = 16 }: Props) {
  const clamped = Math.min(5, Math.max(0, rating));
  const items = [0, 1, 2, 3, 4].map((i) => {
    const filled = clamped >= i + 1;
    return (
      <Text
        key={i}
        style={[
          styles.star,
          { fontSize: size, color: filled ? colors.star : colors.chip },
          i < 4 ? styles.starSpacer : null,
        ]}
      >
        ★
      </Text>
    );
  });
  return <View style={styles.row}>{items}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  starSpacer: {
    marginRight: spacing.xs,
  },
  star: {
    lineHeight: 20,
  },
});
