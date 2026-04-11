import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { authorizedGet, ReviewItem } from "../api";
import { useAuth } from "../auth/AuthContext";
import { AppFooter } from "../components/AppFooter";
import { StarsRow } from "../components/StarsRow";
import { colors, radii, spacing, typography } from "../theme";

function ReviewCard({ item }: { item: ReviewItem }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <StarsRow rating={item.rating} size={14} />
      <Text style={styles.comment}>{item.comment}</Text>
    </View>
  );
}

export function ReviewsScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    const res = await authorizedGet<ReviewItem[]>("/reviews", token);
    setItems(Array.isArray(res) ? res : []);
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
      <FlatList
        style={styles.fill}
        data={items}
        keyExtractor={(it, i) => `${it.name}-${it.date}-${i}`}
        renderItem={({ item }) => <ReviewCard item={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Reviews</Text>
            <Text style={styles.sub}>What customers are saying</Text>
            {error ? <Text style={styles.err}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          !error ? <Text style={styles.muted}>Loading…</Text> : null
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      />
      <AppFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, flexGrow: 1 },
  header: { paddingTop: spacing.sm, paddingBottom: spacing.md },
  title: { ...typography.title, color: colors.text },
  sub: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  err: { color: colors.error, marginTop: spacing.md },
  muted: { color: colors.textMuted, marginTop: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  name: { ...typography.subtitle, color: colors.text },
  date: { ...typography.caption, color: colors.textMuted },
  comment: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22 },
});
