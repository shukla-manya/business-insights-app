import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { authorizedGet, InsightsData } from "../api";
import { useAuth } from "../auth/AuthContext";
import { AppFooter } from "../components/AppFooter";
import { MetricCard } from "../components/MetricCard";
import { colors, radii, spacing, typography } from "../theme";

export function DashboardScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<InsightsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    const res = await authorizedGet<InsightsData>("/insights", token);
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

  const chartData =
    data == null
      ? []
      : [
          { value: data.profile_views, label: "Profile", frontColor: colors.accent },
          { value: data.search_views, label: "Search", frontColor: "#5eead4" },
          { value: data.website_clicks, label: "Web", frontColor: "#2dd4bf" },
          { value: data.phone_calls, label: "Calls", frontColor: "#14b8a6" },
          { value: data.direction_requests, label: "Dirs", frontColor: "#0d9488" },
        ];

  const maxValue = data
    ? Math.max(
        data.profile_views,
        data.search_views,
        data.website_clicks,
        data.phone_calls,
        data.direction_requests,
        1
      ) * 1.15
    : 100;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.sub}>Performance at a glance</Text>
        {error ? <Text style={styles.err}>{error}</Text> : null}
        {data ? (
          <>
            <View style={styles.grid}>
              <MetricCard
                label="Profile views"
                value={data.profile_views}
                icon={<Ionicons name="eye-outline" size={22} color={colors.accent} />}
              />
              <MetricCard
                label="Search views"
                value={data.search_views}
                icon={<Ionicons name="search-outline" size={22} color={colors.accent} />}
              />
              <MetricCard
                label="Website clicks"
                value={data.website_clicks}
                icon={<Ionicons name="link-outline" size={22} color={colors.accent} />}
              />
              <MetricCard
                label="Phone calls"
                value={data.phone_calls}
                icon={<Ionicons name="call-outline" size={22} color={colors.accent} />}
              />
              <MetricCard
                label="Direction requests"
                value={data.direction_requests}
                icon={<Ionicons name="navigate-outline" size={22} color={colors.accent} />}
              />
            </View>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Trend overview</Text>
              <BarChart
                data={chartData}
                barWidth={28}
                spacing={20}
                roundedTop
                roundedBottom
                hideRules
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: colors.textMuted, fontSize: 11 }}
                xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 11 }}
                noOfSections={4}
                maxValue={maxValue}
                isAnimated
                animationDuration={600}
                backgroundColor="transparent"
              />
            </View>
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
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  chartCard: {
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    overflow: "hidden",
  },
  chartTitle: { ...typography.subtitle, color: colors.text, marginBottom: spacing.md, marginLeft: spacing.sm },
  err: { color: colors.error, marginBottom: spacing.md },
  muted: { color: colors.textMuted },
});
