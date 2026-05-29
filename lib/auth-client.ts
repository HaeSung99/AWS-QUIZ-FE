/** 같은 탭에서 localStorage 인증 변경 시 헤더 등이 구독할 이벤트 (`storage`는 다른 탭에서만 발생) */
export const AUTH_STORAGE_CHANGED_EVENT = "aws-quiz-auth-storage-changed";

const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const REFRESH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_REFRESH_TOKEN_KEY;
export const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY;
import { fetchRefreshToken } from "@/lib/api/auth-refresh";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  targetCertificationType?: string | null;
  solvedWorkbookIds?: string[];
};

export type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export function notifyAuthStorageChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_STORAGE_CHANGED_EVENT));
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined" || !ACCESS_TOKEN_KEY) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined" || !REFRESH_TOKEN_KEY) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveAuthSession(data: AuthTokenResponse): void {
  if (typeof window === "undefined" || !ACCESS_TOKEN_KEY || !REFRESH_TOKEN_KEY) {
    return;
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  if (AUTH_USER_KEY) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  }
  notifyAuthStorageChanged();
}

/** 저장된 액세스·리프레시 토큰·유저 정보 제거 후 구독 컴포넌트에 알림 */
export function clearClientAuthStorage(): void {
  if (typeof window === "undefined") return;
  if (ACCESS_TOKEN_KEY) localStorage.removeItem(ACCESS_TOKEN_KEY);
  if (REFRESH_TOKEN_KEY) localStorage.removeItem(REFRESH_TOKEN_KEY);
  if (AUTH_USER_KEY) localStorage.removeItem(AUTH_USER_KEY);
  notifyAuthStorageChanged();
}

/** 인터셉터·세션 검증 공용 — refreshToken으로 access 재발급 */
export async function refreshAuthSession(): Promise<AuthTokenResponse | null> {
  if (!REFRESH_TOKEN_KEY) return null;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const data = await fetchRefreshToken(refreshToken);
    if (!data) return null;
    saveAuthSession(data);
    return data;
  } catch {
    return null;
  }
}
