import React, { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { authorizedGet, BusinessData } from "../api";
import { useAuth } from "../auth/AuthContext";
import { AppFooter } from "../components/AppFooter";
import { StarsRow } from "../components/StarsRow";
import { colors, radii, spacing, typography } from "../theme";

function Row({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

export function BusinessProfileScreen() {
  const { token, signOut } = useAuth();
  const [data, setData] = useState<BusinessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    const res = await authorizedGet<BusinessData>("/business", token);
    setData(res);
  }, [token]);

  const onRefresh = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setRefreshing(false);
    }
  }, [load, token]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <Text style={styles.title}>Business profile</Text>
        <Text style={styles.sub}>Public details customers see</Text>
        {error ? <Text style={styles.err}>{error}</Text> : null}
        {data ? (
          <>
            <View style={styles.hero}>
              <View style={styles.avatar}>
                <Ionicons name="storefront" size={36} color={colors.accent} />
              </View>
              <Text style={styles.name}>{data.name}</Text>
              <Text style={styles.category}>{data.category}</Text>
              <View style={styles.ratingBlock}>
                <Text style={styles.ratingNum}>{data.rating.toFixed(1)}</Text>
                <StarsRow rating={Math.round(data.rating)} />
                <Text style={styles.reviewCount}>{data.total_reviews} reviews</Text>
              </View>
            </View>
            <View style={styles.card}>
              <Row icon="location-outline" label="Address" value={data.address} />
              <Row icon="call-outline" label="Phone" value={data.phone} />
            </View>
            <Pressable onPress={() => signOut()} style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.85 }]}>
              <Text style={styles.outlineBtnText}>Sign out</Text>
            </Pressable>
          </>
        ) : !error ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : null}
      </ScrollView>
      <AppFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.lg },
  title: { ...typography.title, color: colors.text },
  sub: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  err: { color: colors.error, marginBottom: spacing.md },
  muted: { color: colors.textMuted },
  hero: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentGlow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  name: { ...typography.subtitle, color: colors.text, textAlign: "center" },
  category: { ...typography.caption, color: colors.accent, marginTop: spacing.xs },
  ratingBlock: { marginTop: spacing.md, alignItems: "center" },
  ratingNum: { fontSize: 28, fontWeight: "700", color: colors.text },
  reviewCount: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  rowText: { flex: 1 },
  rowLabel: { ...typography.caption, color: colors.textMuted },
  rowValue: { ...typography.body, color: colors.text, marginTop: 2 },
  outlineBtn: {
    marginTop: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  outlineBtnText: { color: colors.textMuted, fontWeight: "600", fontSize: 15 },
});
