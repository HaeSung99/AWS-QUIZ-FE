"use client";

import { clearClientAuthStorage } from "@/lib/auth-client";
import { useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;

/**
 * 앱 진입 시 저장된 JWT가 서버에서 유효한지 `/auth/me`로 확인하고,
 * 무효(401)이면 localStorage 인증 정보를 제거합니다.
 */
export function AuthSessionValidator() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !API_BASE_URL ||
      !ACCESS_TOKEN_KEY
    ) {
      return;
    }

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;

    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.status === 401) {
          clearClientAuthStorage();
        }
      } catch {
        // 네트워크 오류 등 — 클라이언트만으로 판단 불가하여 세션 유지
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
