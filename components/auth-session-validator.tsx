"use client";

import { authApi } from "@/lib/api";
import {
  clearClientAuthStorage,
  getAccessToken,
  getRefreshToken,
  refreshAuthSession,
} from "@/lib/auth-client";
import { useEffect } from "react";

/**
 * 앱 진입 시 access JWT 유효성 확인.
 * 만료(401)이면 axios 인터셉터·refreshAuthSession으로 DB refresh 세션 검증 후 재발급,
 * 실패 시 localStorage 인증 정보 제거.
 */
export function AuthSessionValidator() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const access = getAccessToken();
    const refresh = getRefreshToken();
    if (!access && !refresh) return;

    let cancelled = false;

    void (async () => {
      try {
        await authApi.me();
      } catch {
        const renewed = await refreshAuthSession();
        if (cancelled) return;
        if (!renewed) {
          clearClientAuthStorage();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
