import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { loginRequest } from "../api";
import { useAuth } from "../auth/AuthContext";
import { AppFooter } from "../components/AppFooter";
import { colors, radii, spacing, typography } from "../theme";

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("shuklamanya99@gmail.com");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setError(null);
    setBusy(true);
    try {
      const result = await loginRequest(email.trim(), password);
      await signIn(result.token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <LinearGradient colors={["#0c1222", "#0f172a", "#134e4a"]} style={styles.gradient}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          <View style={styles.centerBlock}>
            <View style={styles.header}>
              <Text style={styles.brand}>Business Insights</Text>
              <Text style={styles.tagline}>Sign in to view your dashboard</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                placeholder="you@company.com"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
              <Text style={[styles.fieldLabel, styles.mt]}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable
                onPress={onSubmit}
                disabled={busy}
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  busy && styles.buttonDisabled,
                ]}
              >
                {busy ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
        <AppFooter blendWithGradient />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  centerBlock: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.lg },
  header: { marginBottom: spacing.xl },
  brand: { ...typography.title, color: colors.text, letterSpacing: 0.5 },
  tagline: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  fieldLabel: { ...typography.caption, color: colors.textMuted },
  mt: { marginTop: spacing.md },
  input: {
    marginTop: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    color: colors.text,
    fontSize: 16,
  },
  error: {
    marginTop: spacing.md,
    color: colors.error,
    fontSize: 14,
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonPressed: { opacity: 0.9 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
});
