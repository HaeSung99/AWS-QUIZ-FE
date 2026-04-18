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

const LINE_CHART = { w: 560, h: 210, padL: 44, padR: 12, padT: 12, padB: 52 };

function formatMonthLabel(ym: string) {
  const [y, m] = ym.split("-");
  if (!y || !m) return ym;
  return `${y}년 ${Number(m)}월`;
}

function niceYMax(max: number) {
  if (max <= 0) return 5;
  const pow10 = 10 ** Math.floor(Math.log10(max));
  const n = max / pow10;
  const ceil = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return ceil * pow10;
}

function yTickValues(yMax: number) {
  const step = yMax / 4;
  return [0, step, step * 2, step * 3, yMax].map((v) => Math.round(v));
}

function xLabelIndices(len: number) {
  if (len <= 0) return [];
  if (len === 1) return [0];
  const want = [0, Math.floor(len / 4), Math.floor(len / 2), Math.floor((len * 3) / 4), len - 1];
  return [...new Set(want)].sort((a, b) => a - b);
}

/** 가로 날짜, 세로 인원 — 선 그래프만 */
function DailyLineChartBlock({
  title,
  rows,
  stroke,
}: {
  title: string;
  rows: DailyRow[];
  stroke: string;
}) {
  const { w, h, padL, padR, padT, padB } = LINE_CHART;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const counts = rows.map((r) => r.count);
  const maxC = counts.length ? Math.max(...counts, 0) : 0;
  const yMax = niceYMax(Math.max(maxC, 1));
  const yTicks = yTickValues(yMax);
  const n = rows.length;
  const labels = xLabelIndices(n);

  let linePoints = "";
  if (n > 1) {
    linePoints = counts
      .map((c, i) => {
        const x = (i / (n - 1)) * innerW;
        const y = innerH - (c / yMax) * innerH;
        return `${x},${y}`;
      })
      .join(" ");
  }

  return (
    <section className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="min-w-[300px] w-full text-neutral-500"
          role="img"
          aria-label={title}
        >
          <text x={padL + innerW / 2} y={h - 10} textAnchor="middle" fill="#737373" style={{ fontSize: "11px" }}>
            날짜
          </text>
          <text
            x={10}
            y={padT + innerH / 2}
            textAnchor="middle"
            fill="#737373"
            style={{ fontSize: "11px" }}
            transform={`rotate(-90 10 ${padT + innerH / 2})`}
          >
            인원
          </text>

          {yTicks.map((tick, ti) => {
            const y = padT + innerH - (tick / yMax) * innerH;
            return (
              <g key={`${tick}-${ti}`}>
                <line
                  x1={padL}
                  y1={y}
                  x2={padL + innerW}
                  y2={y}
                  stroke="rgba(115,115,115,0.22)"
                  strokeDasharray="4 3"
                />
                <text x={padL - 6} y={y + 4} textAnchor="end" fill="#a3a3a3" style={{ fontSize: "10px" }}>
                  {tick}
                </text>
              </g>
            );
          })}

          <line
            x1={padL}
            y1={padT + innerH}
            x2={padL + innerW}
            y2={padT + innerH}
            stroke="#525252"
            strokeWidth="1"
          />
          <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="#525252" strokeWidth="1" />

          {n === 0 ? (
            <text x={w / 2} y={h / 2} textAnchor="middle" fill="#737373" style={{ fontSize: "12px" }}>
              데이터 없음
            </text>
          ) : null}

          {n === 1 ? (
            <circle
              cx={padL + innerW / 2}
              cy={padT + innerH - (counts[0]! / yMax) * innerH}
              r="5"
              fill={stroke}
            />
          ) : null}

          {n > 1 ? (
            <polyline
              fill="none"
              stroke={stroke}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              transform={`translate(${padL},${padT})`}
              points={linePoints}
            />
          ) : null}

          {n > 0 &&
            labels.map((idx) => {
              const x =
                n === 1 ? padL + innerW / 2 : padL + (idx / (n - 1)) * innerW;
              const d = rows[idx]?.date ?? "";
              const short = d.length >= 10 ? `${d.slice(5, 7)}/${d.slice(8, 10)}` : d;
              return (
                <text
                  key={idx}
                  x={x}
                  y={h - 26}
                  textAnchor="middle"
                  fill="#a3a3a3"
                  style={{ fontSize: n > 22 ? "7px" : "9px" }}
                  transform={n > 20 ? `rotate(-40 ${x} ${h - 26})` : undefined}
                >
                  {short}
                </text>
              );
            })}
        </svg>
      </div>
    </section>
  );
}

function MonthlyGridBlock({
  title,
  rows,
}: {
  title: string;
  rows: MonthlyRow[];
}) {
  const list = rows.slice(-12);
  const periodStart = list[0]?.month;
  const periodEnd = list[list.length - 1]?.month;

  return (
    <section className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        {periodStart && periodEnd ? (
          <p className="text-[11px] text-neutral-500">
            기간 {periodStart} ~ {periodEnd} ({list.length}개월)
          </p>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {list.map((row) => (
          <div key={row.month} className="rounded border border-neutral-800 bg-black/40 px-2 py-2">
            <p className="text-[10px] text-neutral-500">{formatMonthLabel(row.month)}</p>
            <p className="mt-0.5 font-mono text-[11px] text-neutral-400">{row.month}</p>
            <p className="mt-1 text-sm font-semibold text-neutral-100">{row.count}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

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
            <DailyLineChartBlock
              title="일자별 접속자수 (최근 30일)"
              rows={overview?.dailyVisitors ?? []}
              stroke="#38bdf8"
            />
            <MonthlyGridBlock title="월자별 접속자수 (최근 12개월)" rows={overview?.monthlyVisitors ?? []} />
            <DailyLineChartBlock
              title="일자별 가입자수 (최근 30일)"
              rows={overview?.dailySignups ?? []}
              stroke="#22c55e"
            />
            <MonthlyGridBlock title="월자별 가입자수 (최근 12개월)" rows={overview?.monthlySignups ?? []} />
          </div>
          {loadingStats ? <p className="text-sm text-neutral-400">통계 불러오는 중...</p> : null}
          {statsError ? <p className="text-sm text-rose-400">{statsError}</p> : null}
        </div>
      </section>
    </main>
  );
}
