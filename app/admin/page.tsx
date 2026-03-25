"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

type AuthUser = { id: number; email: string; name: string; role: "user" | "admin" };
type MockStat = { label: string; value: string; change: string };

const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY;
const subscribeNoop = () => () => {};

const MOCK_DASHBOARD_STATS: MockStat[] = [
  { label: "오늘 페이지 접속자", value: "1,284", change: "+12.4%" },
  { label: "문제집 평균 정답률", value: "68.2%", change: "+3.1%p" },
  { label: "문항 평균 정답률", value: "64.7%", change: "+1.8%p" },
  { label: "문제집 풀이 시도 횟수", value: "3,942", change: "+9.7%" },
];

const MOCK_WORKBOOK_ACCURACY = [
  { name: "SAA 기출 01", accuracy: 72 },
  { name: "DVA 기출 02", accuracy: 61 },
  { name: "SAP 기출 01", accuracy: 55 },
];

const MOCK_QUESTION_ACCURACY = [
  { no: 3, title: "EC2 Auto Scaling", accuracy: 48 },
  { no: 7, title: "S3 수명주기 정책", accuracy: 52 },
  { no: 12, title: "RDS 백업 전략", accuracy: 57 },
];

const MOCK_VISITOR_TREND = [720, 810, 760, 940, 1020, 980, 1284];
const MOCK_CATEGORY_RATIO = [
  { name: "컴퓨팅", ratio: 42, color: "#38bdf8" },
  { name: "스토리지", ratio: 33, color: "#22c55e" },
  { name: "네트워크", ratio: 15, color: "#f59e0b" },
  { name: "보안", ratio: 10, color: "#f43f5e" },
];

export default function AdminDashboardPage() {
  const isHydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const auth = (() => {
    if (!isHydrated || !ACCESS_TOKEN_KEY || !AUTH_USER_KEY) {
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

  if (!isHydrated) {
    return <main className="flex flex-1 items-center justify-center text-neutral-300">확인 중...</main>;
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
            {MOCK_DASHBOARD_STATS.map((stat) => (
              <article key={stat.label} className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
                <p className="text-xs text-neutral-400">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-100">{stat.value}</p>
                <p className="mt-1 text-xs text-emerald-400">{stat.change}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
              <h2 className="text-sm font-semibold">일주일 접속자 추이(가상)</h2>
              <svg viewBox="0 0 300 120" className="mt-3 h-40 w-full">
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  points={MOCK_VISITOR_TREND.map((value, idx) => {
                    const x = (idx / (MOCK_VISITOR_TREND.length - 1)) * 300;
                    const min = Math.min(...MOCK_VISITOR_TREND);
                    const max = Math.max(...MOCK_VISITOR_TREND);
                    const y = 110 - ((value - min) / (max - min || 1)) * 90;
                    return `${x},${y}`;
                  }).join(" ")}
                />
              </svg>
            </section>

            <section className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
              <h2 className="text-sm font-semibold">문제 유형 비중(가상)</h2>
              <div className="mt-3 flex items-center gap-4">
                <div
                  className="h-32 w-32 rounded-full"
                  style={{
                    background: `conic-gradient(
                      ${MOCK_CATEGORY_RATIO[0].color} 0 ${MOCK_CATEGORY_RATIO[0].ratio}%,
                      ${MOCK_CATEGORY_RATIO[1].color} ${MOCK_CATEGORY_RATIO[0].ratio}% ${MOCK_CATEGORY_RATIO[0].ratio + MOCK_CATEGORY_RATIO[1].ratio}%,
                      ${MOCK_CATEGORY_RATIO[2].color} ${MOCK_CATEGORY_RATIO[0].ratio + MOCK_CATEGORY_RATIO[1].ratio}% ${MOCK_CATEGORY_RATIO[0].ratio + MOCK_CATEGORY_RATIO[1].ratio + MOCK_CATEGORY_RATIO[2].ratio}%,
                      ${MOCK_CATEGORY_RATIO[3].color} ${MOCK_CATEGORY_RATIO[0].ratio + MOCK_CATEGORY_RATIO[1].ratio + MOCK_CATEGORY_RATIO[2].ratio}% 100%
                    )`,
                  }}
                />
                <ul className="space-y-1 text-sm">
                  {MOCK_CATEGORY_RATIO.map((item) => (
                    <li key={item.name}>
                      {item.name} {item.ratio}%
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
              <h2 className="text-sm font-semibold">문제집 정답률(가상)</h2>
              <ul className="mt-3 space-y-2">
                {MOCK_WORKBOOK_ACCURACY.map((item) => (
                  <li key={item.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{item.name}</span>
                      <span>{item.accuracy}%</span>
                    </div>
                    <div className="h-2 rounded bg-neutral-800">
                      <div className="h-2 rounded bg-sky-500" style={{ width: `${item.accuracy}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
              <h2 className="text-sm font-semibold">문항 정답률 하위(가상)</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {MOCK_QUESTION_ACCURACY.map((item) => (
                  <li key={item.no} className="rounded-md border border-neutral-700 bg-black/40 px-3 py-2">
                    {item.no}번 - {item.title} / 정답률 {item.accuracy}%
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
