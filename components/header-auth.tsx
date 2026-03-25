"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY;
type AuthSnapshot = { isLoggedIn: boolean; isAdmin: boolean };
const LOGGED_OUT_SNAPSHOT: AuthSnapshot = { isLoggedIn: false, isAdmin: false };
let cachedSnapshotKey = "";
let cachedSnapshot: AuthSnapshot = LOGGED_OUT_SNAPSHOT;

function getClientSnapshot(): AuthSnapshot {
  if (typeof window === "undefined" || !ACCESS_TOKEN_KEY || !AUTH_USER_KEY) {
    return LOGGED_OUT_SNAPSHOT;
  }

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const userRaw = localStorage.getItem(AUTH_USER_KEY);
  let isAdmin = false;

  if (userRaw) {
    try {
      isAdmin = JSON.parse(userRaw)?.role === "admin";
    } catch {
      isAdmin = false;
    }
  }

  const snapshotKey = `${token ?? ""}|${isAdmin ? "admin" : "user"}`;
  if (snapshotKey === cachedSnapshotKey) {
    return cachedSnapshot;
  }

  cachedSnapshotKey = snapshotKey;
  cachedSnapshot = { isLoggedIn: Boolean(token), isAdmin };
  return cachedSnapshot;
}

function subscribeToAuthStore(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
  };
}

export function HeaderAuth() {
  const router = useRouter();
  usePathname();

  const { isLoggedIn, isAdmin } = useSyncExternalStore(
    subscribeToAuthStore,
    getClientSnapshot,
    () => LOGGED_OUT_SNAPSHOT,
  );

  const handleLogout = () => {
    if (!ACCESS_TOKEN_KEY || !AUTH_USER_KEY) {
      return;
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    router.push("/");
    router.refresh();
  };

  if (!isLoggedIn) {
    return (
      <>
        <Link
          href="/login"
          className="rounded-md border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 transition hover:border-neutral-400 hover:bg-neutral-900"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-amber-600/60 bg-amber-950/40 px-3 py-1.5 text-sm font-medium text-amber-100 transition hover:border-amber-500 hover:bg-amber-950/70"
        >
          회원가입
        </Link>
      </>
    );
  }

  return (
    <>
      {isAdmin ? (
        <Link
          href="/admin"
          className="rounded-md border border-sky-600/60 bg-sky-950/40 px-3 py-1.5 text-sm font-medium text-sky-100 transition hover:border-sky-500 hover:bg-sky-950/70"
        >
          Admin
        </Link>
      ) : null}
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-md border border-rose-600/60 bg-rose-950/40 px-3 py-1.5 text-sm font-medium text-rose-100 transition hover:border-rose-500 hover:bg-rose-950/70"
      >
        로그아웃
      </button>
    </>
  );
}
