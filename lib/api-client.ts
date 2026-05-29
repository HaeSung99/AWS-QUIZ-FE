import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  clearClientAuthStorage,
  getAccessToken,
  refreshAuthSession,
} from "@/lib/auth-client";

import { API_BASE_URL } from "@/lib/api/config";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** 인증 API 401 시 refresh → access 재발급 후 원 요청 1회 재시도 */
export const api = axios.create({
  baseURL: API_BASE_URL,
});

/** refresh 토큰 갱신 중인지 확인 */
let refreshInFlight: Promise<boolean> | null = null;

/** access 토큰 갱신 */
async function ensureFreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = refreshAuthSession()
      .then((data) => Boolean(data?.accessToken))
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/** 인증 관련 URL 인지 확인 */
function isAuthRefreshUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes("/auth/refresh") ||
    url.includes("/auth/login") ||
    url.includes("/auth/signup")
  );
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry ||
      isAuthRefreshUrl(original.url)
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    const refreshed = await ensureFreshAccessToken();
    if (!refreshed) {
      clearClientAuthStorage();
      return Promise.reject(error);
    }

    const token = getAccessToken();
    if (token) {
      original.headers.Authorization = `Bearer ${token}`;
    }
    return api(original);
  },
);
