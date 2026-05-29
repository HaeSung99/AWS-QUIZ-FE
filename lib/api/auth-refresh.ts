import type { AuthTokenResponse } from "@/lib/auth-client";
import { API_BASE_URL } from "./config";

/** 인터셉터 없이 refresh — api-client ↔ auth-client 순환 참조 방지 */
export async function fetchRefreshToken(
  refreshToken: string,
): Promise<AuthTokenResponse | null> {
  if (!API_BASE_URL) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AuthTokenResponse;
    if (!data.accessToken || !data.refreshToken) return null;
    return data;
  } catch {
    return null;
  }
}
