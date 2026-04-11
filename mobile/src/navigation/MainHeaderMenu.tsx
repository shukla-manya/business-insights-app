import React, { useMemo, useState } from "react";
import { Modal, PixelRatio, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, spacing, typography } from "../theme";

/** Menu icon accent — matches theme `colors.accent` / teal spec #2dd4bf */
const MENU_ICON_COLOR = "#2dd4bf";

export type MainStackParamList = {
  Dashboard: undefined;
  Business: undefined;
  Reviews: undefined;
};

type MainNav = NativeStackNavigationProp<MainStackParamList>;

const ITEMS: {
  name: keyof MainStackParamList;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: "Dashboard", label: "Insights", icon: "stats-chart" },
  { name: "Business", label: "Business profile", icon: "storefront-outline" },
  { name: "Reviews", label: "Reviews", icon: "chatbubbles-outline" },
];

/** Dropdown width + circular menu button (always width === height, radius = diameter/2). */
function useMenuLayoutMetrics() {
  const { width, height, fontScale } = useWindowDimensions();
  return useMemo(() => {
    const shortest = Math.min(width, height);
    const baseRef = 390;
    const sizeScale = Math.min(Math.max(shortest / baseRef, 0.9), 1.15);
    const a11y = fontScale > 1 ? Math.min(fontScale, 1.35) : 1;
    let diameter = 44 * sizeScale * (1 + (a11y - 1) * 0.3);
    diameter = Math.min(Math.max(PixelRatio.roundToNearestPixel(diameter), 44), 56);
    const radius = diameter / 2;
    const barW = PixelRatio.roundToNearestPixel(diameter * 0.38);
    const barH = Math.max(2, PixelRatio.roundToNearestPixel(diameter * 0.062));
    const barGap = PixelRatio.roundToNearestPixel(diameter * 0.09);
    const horizontalPad = spacing.md * 2;
    const menuPanelW = Math.min(PixelRatio.roundToNearestPixel(288 * sizeScale), width - horizontalPad);
    const hitSlop =
      diameter < 48
        ? {
            top: Math.ceil((48 - diameter) / 2),
            bottom: Math.ceil((48 - diameter) / 2),
            left: Math.ceil((48 - diameter) / 2),
            right: Math.ceil((48 - diameter) / 2),
          }
        : undefined;
    return { diameter, radius, barW, barH, barGap, menuPanelW, hitSlop };
  }, [width, height, fontScale]);
}

export function MainHeaderMenu() {
  const [open, setOpen] = useState(false);
  const navigation = useNavigation<MainNav>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const menuTop = insets.top + headerHeight + spacing.xs;
  const m = useMenuLayoutMetrics();

  function go(name: keyof MainStackParamList) {
    setOpen(false);
    navigation.navigate(name);
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={m.hitSlop}
        style={({ pressed }) => [styles.menuBtnPressable, pressed && styles.menuBtnPressablePressed]}
        accessibilityRole="button"
        accessibilityLabel="Open navigation menu"
      >
        {({ pressed }) => (
          <View
            style={[
              styles.menuBtnCircle,
              {
                width: m.diameter,
                height: m.diameter,
                borderRadius: m.radius,
              },
              pressed && styles.menuBtnCirclePressed,
            ]}
          >
            <View style={[styles.menuBtnHamburger, { gap: m.barGap }]} pointerEvents="none">
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={{
                    width: m.barW,
                    height: m.barH,
                    borderRadius: m.barH / 2,
                    backgroundColor: MENU_ICON_COLOR,
                    opacity: pressed ? 0.92 : 1,
                  }}
                />
              ))}
            </View>
          </View>
        )}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Close menu" />
          <View
            style={[styles.menuAnchor, { top: menuTop, right: spacing.md, width: m.menuPanelW }]}
            pointerEvents="box-none"
          >
            <LinearGradient
              colors={["#1e293b", colors.card, colors.bgElevated]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.menuCard}
            >
              <View style={styles.menuAccentLine} />
              <Text style={styles.menuHeading}>Menu</Text>
              {ITEMS.map((item, index) => {
                const active = route.name === item.name;
                return (
                  <Pressable
                    key={item.name}
                    onPress={() => go(item.name)}
                    style={({ pressed }) => [
                      styles.item,
                      index > 0 && styles.itemBorder,
                      active && styles.itemActive,
                      pressed && styles.itemPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <View style={[styles.itemIcon, active && styles.itemIconActive]}>
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={active ? colors.accent : colors.textMuted}
                      />
                    </View>
                    <Text style={[styles.itemLabel, active && styles.itemLabelActive]} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={active ? colors.accent : colors.textMuted}
                      style={styles.chevron}
                    />
                  </Pressable>
                );
              })}
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuBtnPressable: {
    marginRight: spacing.sm,
  },
  /** Uniform scale only — circle stays circular; no layout dimension changes. */
  menuBtnPressablePressed: {
    transform: [{ scale: 0.96 }],
  },
  menuBtnCircle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(45, 212, 191, 0.35)",
    shadowColor: MENU_ICON_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  menuBtnCirclePressed: {
    backgroundColor: colors.bgElevated,
    borderColor: "rgba(45, 212, 191, 0.48)",
  },
  menuBtnHamburger: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
  },
  menuAnchor: {
    position: "absolute",
    maxWidth: "92%",
  },
  menuCard: {
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.25)",
    overflow: "hidden",
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
  },
  menuAccentLine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.accent,
    opacity: 0.85,
  },
  menuHeading: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.textMuted,
    marginLeft: spacing.md + 2,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: radii.md,
  },
  itemBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
  },
  itemActive: {
    backgroundColor: colors.accentGlow,
  },
  itemPressed: {
    opacity: 0.92,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  itemIconActive: {
    borderColor: "rgba(45, 212, 191, 0.4)",
    backgroundColor: "rgba(45, 212, 191, 0.12)",
  },
  itemLabel: {
    flex: 1,
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: colors.textMuted,
  },
  itemLabelActive: {
    color: colors.text,
  },
  chevron: { opacity: 0.9 },
});
