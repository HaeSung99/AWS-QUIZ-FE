"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

type AuthUser = { id: number; email: string; name: string; role: "user" | "admin" };
type DailyRow = { date: string; count: number };
type MonthlyRow = { month: string; count: number };
type AdminOverview = {
  totalUsers: number;
  todayVisitors: number;
  dailySignups: DailyRow[];
  monthlySignups: MonthlyRow[];
  dailyVisitors: DailyRow[];
  monthlyVisitors: MonthlyRow[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY;
const subscribeNoop = () => () => {};

export default function AdminDashboardPage() {
  const isHydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  const auth = (() => {
    if (!isHydrated || !API_BASE_URL || !ACCESS_TOKEN_KEY || !AUTH_USER_KEY) {
      return { token: null as string | null, user: null as AuthUser | null };
    }
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!token || !raw) return { token: null, user: null };
    try {
      return { token, user: JSON.parse(raw) as AuthUser };
    } catch {
      return { token: null, user: null };
    }
  })();
  const authRole = auth.user?.role ?? null;

  useEffect(() => {
    if (!API_BASE_URL || !auth.token || authRole !== "admin") return;
    setLoadingStats(true);
    setStatsError("");
    void (async () => {
      try {
        const { data } = await axios.get<AdminOverview>(`${API_BASE_URL}/admin/stats/overview`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setOverview(data);
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? (Array.isArray(err.response?.data?.message)
              ? err.response?.data?.message.join(", ")
              : err.response?.data?.message) ?? err.message
          : "통계를 불러오지 못했습니다.";
        setStatsError(message || "통계를 불러오지 못했습니다.");
        setOverview(null);
      } finally {
        setLoadingStats(false);
      }
    })();
  }, [auth.token, authRole]);

  const buildLinePoints = (values: number[]) => {
    if (values.length === 0) return "";
    if (values.length === 1) return `0,70 300,70`;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return values
      .map((value, idx) => {
        const x = (idx / (values.length - 1)) * 300;
        const y = 110 - ((value - min) / (max - min || 1)) * 90;
        return `${x},${y}`;
      })
      .join(" ");
  };

  if (!isHydrated) {
    return <main className="flex flex-1 items-center justify-center text-neutral-300">확인 중...</main>;
  }

  if (!API_BASE_URL || !ACCESS_TOKEN_KEY || !AUTH_USER_KEY) {
    return (
      <main className="flex flex-1 items-center justify-center text-neutral-300">
        환경변수 설정을 확인해주세요.
      </main>
    );
  }

  if (!auth.token || !auth.user || auth.user.role !== "admin") {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-950/70 p-6 text-center">
          <h1 className="text-lg font-semibold text-neutral-100">Admin 접근 제한</h1>
          <p className="mt-2 text-sm text-neutral-400">관리자 계정으로 로그인해야 합니다.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link href="/login" className="rounded-md border border-neutral-500 px-3 py-1.5 text-sm">
              로그인
            </Link>
            <Link href="/" className="text-sm text-sky-400 hover:underline">
              메인으로
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 bg-black text-neutral-100">
      <aside className="w-60 shrink-0 border-r border-neutral-800 bg-neutral-950 p-4">
        <h1 className="text-base font-semibold">Admin Dashboard</h1>
        <div className="mt-5 flex flex-col gap-2">
          <Link href="/admin" className="rounded-md border border-sky-500 bg-sky-950/30 px-3 py-2 text-sm text-sky-200">
            통계
          </Link>
          <Link href="/admin/notice" className="rounded-md border border-neutral-700 px-3 py-2 text-sm">
            공지
          </Link>
          <Link href="/admin/workbook" className="rounded-md border border-neutral-700 px-3 py-2 text-sm">
            문제집
          </Link>
        </div>
      </aside>

      <section className="flex-1 p-6">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
              <p className="text-xs text-neutral-400">총 가입자수</p>
              <p className="mt-2 text-2xl font-semibold text-neutral-100">{overview?.totalUsers ?? "-"}</p>
            </article>
            <article className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
              <p className="text-xs text-neutral-400">오늘 접속자수</p>
              <p className="mt-2 text-2xl font-semibold text-neutral-100">
                {overview?.todayVisitors ?? "-"}
              </p>
            </article>
            <article className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
              <p className="text-xs text-neutral-400">최근 일자별 가입자(30일)</p>
              <p className="mt-2 text-2xl font-semibold text-neutral-100">
                {overview?.dailySignups?.reduce((acc, cur) => acc + cur.count, 0) ?? "-"}
              </p>
            </article>
            <article className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
              <p className="text-xs text-neutral-400">최근 월자별 가입자(12개월)</p>
              <p className="mt-2 text-2xl font-semibold text-neutral-100">
                {overview?.monthlySignups?.reduce((acc, cur) => acc + cur.count, 0) ?? "-"}
              </p>
            </article>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
              <h2 className="text-sm font-semibold">일자별 접속자수 (최근 30일)</h2>
              <svg viewBox="0 0 300 120" className="mt-3 h-44 w-full">
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  points={buildLinePoints((overview?.dailyVisitors ?? []).map((row) => row.count))}
                />
              </svg>
              <p className="mt-2 text-xs text-neutral-400">
                최근값: {overview?.dailyVisitors?.[overview.dailyVisitors.length - 1]?.count ?? 0}명
              </p>
            </section>

            <section className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
              <h2 className="text-sm font-semibold">월자별 접속자수 (최근 12개월)</h2>
              <div className="mt-3 grid grid-cols-6 gap-2">
                {(overview?.monthlyVisitors ?? []).slice(-6).map((row) => (
                  <div key={row.month} className="rounded bg-black/40 px-2 py-2 text-center">
                    <p className="text-[11px] text-neutral-500">{row.month.slice(5)}</p>
                    <p className="mt-1 text-xs text-neutral-200">{row.count}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
              <h2 className="text-sm font-semibold">일자별 가입자수 (최근 30일)</h2>
              <svg viewBox="0 0 300 120" className="mt-3 h-44 w-full">
                <polyline
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  points={buildLinePoints((overview?.dailySignups ?? []).map((row) => row.count))}
                />
              </svg>
              <p className="mt-2 text-xs text-neutral-400">
                최근값: {overview?.dailySignups?.[overview.dailySignups.length - 1]?.count ?? 0}명
              </p>
            </section>

            <section className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
              <h2 className="text-sm font-semibold">월자별 가입자수 (최근 12개월)</h2>
              <div className="mt-3 grid grid-cols-6 gap-2">
                {(overview?.monthlySignups ?? []).slice(-6).map((row) => (
                  <div key={row.month} className="rounded bg-black/40 px-2 py-2 text-center">
                    <p className="text-[11px] text-neutral-500">{row.month.slice(5)}</p>
                    <p className="mt-1 text-xs text-neutral-200">{row.count}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          {loadingStats ? <p className="text-sm text-neutral-400">통계 불러오는 중...</p> : null}
          {statsError ? <p className="text-sm text-rose-400">{statsError}</p> : null}
        </div>
      </section>
    </main>
  );
}
