import Constants from "expo-constants";

export function getApiBase(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (typeof envUrl === "string" && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/$/, "");
  }
  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
  if (extra?.apiUrl && extra.apiUrl.trim().length > 0) {
    return extra.apiUrl.trim().replace(/\/$/, "");
  }
  return "http://127.0.0.1:4000";
}
