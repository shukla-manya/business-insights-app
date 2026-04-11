import { getApiBase } from "./config";

export type LoginResult = { token: string; user: { email: string } };

export type BusinessData = {
  name: string;
  category: string;
  address: string;
  phone: string;
  rating: number;
  total_reviews: number;
};

export type InsightsData = {
  profile_views: number;
  search_views: number;
  website_clicks: number;
  phone_calls: number;
  direction_requests: number;
};

export type ReviewItem = {
  name: string;
  rating: number;
  comment: string;
  date: string;
};

export async function loginRequest(email: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${getApiBase()}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = (await res.json()) as { success?: boolean; message?: string; data?: LoginResult };
  if (!res.ok || !json.success || !json.data?.token) {
    throw new Error(json.message || "Login failed");
  }
  return json.data;
}

export async function authorizedGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = (await res.json()) as { success?: boolean; message?: string; data?: T };
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Request failed");
  }
  return json.data as T;
}
