"use client";

import axios from "axios";
import Link from "next/link";
import { formatDateTimeSeoul } from "@/lib/date-kst";
import { SITE_FAQ_ITEMS } from "@/lib/seo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY;
const NOTICE_HOME_MAX = 4;
const OPEN_CHAT_URL = "https://open.kakao.com/o/spyj5doi";
const CONTACT_EMAIL = "inseok1999@gmail.com";
const SITE_CERT_GUIDE = {
  title: "AWS 자격증 가이드",
  groups: [
    {
      cert: "SAA-C03",
      note: "참고용 가이드",
      href: "/guide/saa-c03",
    },
    {
      cert: "CLF-C02",
      note: "준비중입니다.",
      href: "/guide/clf-c02",
    },
  ],
  officialDocs: {
    label: "AWS 공식 문서",
    href: "https://docs.aws.amazon.com/",
  },
};

type NoticeItem = { id: string; title: string; body: string; pinned?: boolean };
type WorkbookItem = {
  id: string;
  certificationType: string;
  title: string;
  summary: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};
type WorkbookAccuracyItem = {
  workbookId: string;
  title: string;
  accuracy: number;
  attemptCount: number;
};
type WeakCategoryItem = {
  category: string;
  totalCount: number;
  correctCount: number;
  wrongCount: number;
  wrongRate: number;
};
type WeaknessComment = {
  comment: string;
  attemptCount: number;
  requiredAttemptCount: number;
  remainingAttemptCount: number;
  ready: boolean;
};
type StoredUser = {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
  targetCertificationType?: string | null;
  solvedWorkbookIds?: string[];
};

const workbookLatestTime = (w: WorkbookItem) => {
  const u = w.updatedAt ? new Date(w.updatedAt).getTime() : NaN;
  const c = w.createdAt ? new Date(w.createdAt).getTime() : NaN;
  if (!Number.isNaN(u)) return u;
  if (!Number.isNaN(c)) return c;
  return 0;
};

export default function HomeClient() {
  const [search, setSearch] = useState("");
  const [noticeItems, setNoticeItems] = useState<NoticeItem[]>([]);
  const [workbookItems, setWorkbookItems] = useState<WorkbookItem[]>([]);
  const [workbookAccuracyMap, setWorkbookAccuracyMap] = useState<
    Record<string, number>
  >({});
  const [myWeakCategories, setMyWeakCategories] = useState<WeakCategoryItem[]>(
    [],
  );
  const [globalWeakCategories, setGlobalWeakCategories] = useState<
    WeakCategoryItem[]
  >([]);
  const [weakCategoriesLoading, setWeakCategoriesLoading] = useState(false);
  const [weaknessComment, setWeaknessComment] = useState("");
  const [weaknessCommentLoading, setWeaknessCommentLoading] = useState(false);
  const [weaknessProgress, setWeaknessProgress] = useState<{
    attemptCount: number;
    requiredAttemptCount: number;
    remainingAttemptCount: number;
    ready: boolean;
  } | null>(null);
  const [solvedWorkbookIds, setSolvedWorkbookIds] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [targetCertificationType, setTargetCertificationType] = useState<string | null>(null);
  const [showDailyCertModal, setShowDailyCertModal] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const sentVisitEventsRef = useRef<Set<string>>(new Set());

  const getClientKey = useCallback(() => {
    if (typeof window === "undefined") return "";
    const saved = localStorage.getItem("aws_quiz_visit_key");
    const clientKey =
      saved ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
    if (!saved) {
      localStorage.setItem("aws_quiz_visit_key", clientKey);
    }
    return clientKey;
  }, []);

  const trackVisitEvent = useCallback(
    (eventType: string) => {
      if (!API_BASE_URL || typeof window === "undefined") return;
      if (sentVisitEventsRef.current.has(eventType)) return;
      sentVisitEventsRef.current.add(eventType);
      const clientKey = getClientKey();
      const isLoggedInNow = ACCESS_TOKEN_KEY
        ? Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
        : false;
      void axios
        .post(`${API_BASE_URL}/public/track-visit`, {
          clientKey,
          eventType,
          isLoggedIn: isLoggedInNow,
        })
        .catch(() => undefined);
    },
    [getClientKey],
  );

  useEffect(() => {
    if (!API_BASE_URL) return;
    void (async () => {
      try {
        const { data } = await axios.get<NoticeItem[]>(
          `${API_BASE_URL}/public/notices`,
        );
        setNoticeItems(Array.isArray(data) ? data : []);
      } catch {
        setNoticeItems([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!API_BASE_URL || !ACCESS_TOKEN_KEY || typeof window === "undefined")
      return;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;

    void (async () => {
      setWeakCategoriesLoading(true);
      try {
        const [personal, global] = await Promise.all([
          axios.get<WeakCategoryItem[]>(
            `${API_BASE_URL}/auth/me/weak-categories`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
          axios.get<WeakCategoryItem[]>(
            `${API_BASE_URL}/auth/weak-categories/global`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
        ]);
        setMyWeakCategories(Array.isArray(personal.data) ? personal.data : []);
        setGlobalWeakCategories(Array.isArray(global.data) ? global.data : []);
      } catch {
        setMyWeakCategories([]);
        setGlobalWeakCategories([]);
      } finally {
        setWeakCategoriesLoading(false);
      }
    })();

    void (async () => {
      setWeaknessCommentLoading(true);
      try {
        const { data } = await axios.get<WeaknessComment>(
          `${API_BASE_URL}/auth/me/weakness-comment`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setWeaknessComment(data.comment);
        setWeaknessProgress({
          attemptCount: data.attemptCount,
          requiredAttemptCount: data.requiredAttemptCount,
          remainingAttemptCount: data.remainingAttemptCount,
          ready: data.ready,
        });
      } catch {
        setWeaknessComment("");
        setWeaknessProgress(null);
      } finally {
        setWeaknessCommentLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!API_BASE_URL) return;
    void (async () => {
      try {
        const { data } = await axios.get<WorkbookItem[]>(
          `${API_BASE_URL}/public/workbooks`,
        );
        setWorkbookItems(Array.isArray(data) ? data : []);
      } catch {
        setWorkbookItems([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!API_BASE_URL) return;
    void (async () => {
      try {
        const { data } = await axios.get<WorkbookAccuracyItem[]>(
          `${API_BASE_URL}/public/workbooks/accuracy`,
        );
        if (!Array.isArray(data)) {
          setWorkbookAccuracyMap({});
          return;
        }
        const map: Record<string, number> = {};
        for (const row of data) {
          map[row.workbookId] = row.accuracy;
        }
        setWorkbookAccuracyMap(map);
      } catch {
        setWorkbookAccuracyMap({});
      }
    })();
  }, []);

  useEffect(() => {
    trackVisitEvent("page_view");

    const dwellTimer = window.setTimeout(() => {
      trackVisitEvent("dwell_5s");
    }, 5_000);

    const onScroll = () => {
      trackVisitEvent("scroll");
      window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(dwellTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [trackVisitEvent]);

  useEffect(() => {
    if (
      !API_BASE_URL ||
      !ACCESS_TOKEN_KEY ||
      !AUTH_USER_KEY ||
      typeof window === "undefined"
    ) {
      return;
    }

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const rawUser = localStorage.getItem(AUTH_USER_KEY);
    if (!token || !rawUser) return;

    void (async () => {
      setIsLoggedIn(Boolean(token));
      try {
        const parsed = JSON.parse(rawUser) as StoredUser;
        if (Array.isArray(parsed.solvedWorkbookIds)) {
          setSolvedWorkbookIds(parsed.solvedWorkbookIds);
        }
        setTargetCertificationType(parsed.targetCertificationType ?? null);
      } catch {
        setSolvedWorkbookIds([]);
        setTargetCertificationType(null);
      }

      try {
        const { data } = await axios.get<{ user: StoredUser }>(
          `${API_BASE_URL}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const solved = Array.isArray(data.user?.solvedWorkbookIds)
          ? data.user.solvedWorkbookIds
          : [];
        setSolvedWorkbookIds(solved);
        setTargetCertificationType(data.user?.targetCertificationType ?? null);

        if (data.user) {
          localStorage.setItem(
            AUTH_USER_KEY,
            JSON.stringify({ ...data.user, solvedWorkbookIds: solved }),
          );
        }
      } catch {}
    })();
  }, []);

  const noticePreview = noticeItems.slice(0, NOTICE_HOME_MAX);
  const filteredWorkbooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return workbookItems;
    return workbookItems.filter((w) => w.title.toLowerCase().includes(q));
  }, [search, workbookItems]);
  const displayedWorkbooks = useMemo(() => {
    const sorted = [...filteredWorkbooks].sort(
      (a, b) => workbookLatestTime(b) - workbookLatestTime(a),
    );
    if (search.trim()) return sorted;
    return sorted.slice(0, 12);
  }, [filteredWorkbooks, search]);
  const topWeakCategory = myWeakCategories[0] ?? null;
  const learningSummaryCards = [
    {
      label: "풀이 완료",
      value: `${solvedWorkbookIds.length}/${workbookItems.length || "-"}`,
      helper: "완료한 문제집",
      tone: "emerald",
    },
    {
      label: "약점 분석",
      value: isLoggedIn
        ? weaknessProgress
          ? weaknessProgress.ready
            ? "준비 완료"
            : `${weaknessProgress.remainingAttemptCount}문제 남음`
          : "기록 대기"
        : "로그인 필요",
      helper: weaknessProgress
        ? `${weaknessProgress.attemptCount}/${weaknessProgress.requiredAttemptCount}문제 기록`
        : "최근 50문제 기준",
      tone: "fuchsia",
    },
    {
      label: "이용자님의 주요 약점",
      value: isLoggedIn
        ? (topWeakCategory?.category ?? "데이터 대기")
        : "로그인 필요",
      helper: !isLoggedIn
        ? "로그인하면 개인 약점이 표시됩니다"
        : topWeakCategory
          ? `개인 풀이 기준 오답률 ${topWeakCategory.wrongRate.toFixed(1)}%`
          : "문제를 풀면 개인 약점이 표시됩니다",
      tone: "sky",
    },
  ];

  const onCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopyMessage("메일 복사 완료!");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch {
      setCopyMessage("메일 복사 실패. 다시 시도해주세요.");
      setTimeout(() => setCopyMessage(""), 2000);
    }
  };

  const handleDailyQuestionClick = () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    if (!targetCertificationType) {
      setShowDailyCertModal(true);
      return;
    }
    window.location.href = "/Quiz?daily=true";
  };

  const renderWeakCategoryList = (
    title: string,
    items: WeakCategoryItem[],
    emptyText: string,
    isLoading: boolean,
  ) => (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.025)]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {title}
        </h2>
        {showDailyCertModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-950 p-6 shadow-2xl">
              <h2 className="text-lg font-semibold">목표 자격증을 먼저 선택해주세요</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-400">
                오늘의 문제는 준비 중인 자격증을 기준으로 제공됩니다. 마이페이지에서 목표
                자격증을 선택한 뒤 다시 시도해주세요.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Link
                  href="/mypage"
                  className="inline-flex justify-center rounded-lg border border-sky-500/70 bg-sky-500 px-4 py-2 text-sm font-semibold text-sky-950 transition hover:bg-sky-400"
                >
                  마이페이지로 이동
                </Link>
                <button
                  type="button"
                  onClick={() => setShowDailyCertModal(false)}
                  className="inline-flex justify-center rounded-lg border border-neutral-600 px-4 py-2 text-sm text-neutral-200 transition hover:border-neutral-400"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {isLoading ? (
          <>
            {[0, 1, 2].map((idx) => (
              <li
                key={`${title}-loading-${idx}`}
                className="rounded-lg border border-neutral-800 bg-neutral-950/70 px-3 py-2"
              >
                <div className="h-4 w-32 animate-pulse rounded bg-neutral-700/70" />
                <div className="mt-2 h-3 w-48 animate-pulse rounded bg-neutral-800" />
              </li>
            ))}
          </>
        ) : items.length > 0 ? (
          items.map((item) => (
            <li
              key={`${title}-${item.category}`}
              className="rounded-lg border border-neutral-800 bg-neutral-950/70 px-3 py-3 transition hover:border-neutral-700"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-100">
                    {item.category}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    오답 {item.wrongCount}개 / 풀이 {item.totalCount}개 · 오답률{" "}
                    {item.wrongRate.toFixed(1)}%
                  </p>
                </div>
                <Link
                  href={
                    isLoggedIn
                      ? `/Quiz?category=${encodeURIComponent(item.category)}`
                      : "/login"
                  }
                  className="inline-flex shrink-0 items-center justify-center rounded-md border border-sky-600/60 bg-sky-950/40 px-3 py-1.5 text-xs font-medium text-sky-100 transition hover:border-sky-400 hover:bg-sky-900/50"
                >
                  이 유형 풀기
                </Link>
              </div>
            </li>
          ))
        ) : (
          <li className="rounded-lg border border-dashed border-neutral-700 px-3 py-4 text-center text-xs text-neutral-500">
            {emptyText}
          </li>
        )}
      </ul>
    </section>
  );

  return (
    <main
      className="min-h-screen bg-neutral-950 px-4 py-10 text-neutral-100"
      onClickCapture={() => trackVisitEvent("click")}
    >
      <div className="mx-auto flex w-full max-w-[81rem] flex-col gap-7">
        <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(10,10,10,0.98))] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.035)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <header className="space-y-4">
              <div className="inline-flex rounded-full border border-sky-500/30 bg-sky-950/40 px-3 py-1 text-[11px] font-medium text-sky-200">
                AWS 시험 대비 학습 대시보드
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
                  약점을 찾고, 다음에 풀 문제까지 이어가는 AWS Quiz KR
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-300">
                  한국어 객관식으로{" "}
                  <strong className="font-medium text-neutral-200">
                    AWS SAA·aws saa·SAA-C03
                  </strong>
                  와 CLF 등 자격증 시험을 준비할 수 있습니다. 검색에서 말하는{" "}
                  <strong className="font-medium text-neutral-200">
                    saa 덤프·aws 덤프
                  </strong>
                  는 본 서비스에서는{" "}
                  <strong className="font-medium text-sky-200">
                    실제 시험 원문 복제가 아닌, 자체 제작 예상문제를 쌓아 둔 문제집
                  </strong>
                  을 가리킵니다. 풀이 기록으로 약점 유형·유사 문제·AI 코멘트까지 이어집니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDailyQuestionClick}
                  className="inline-flex items-center justify-center rounded-lg border border-sky-500/70 bg-sky-500 px-4 py-2 text-sm font-semibold text-sky-950 transition hover:bg-sky-400"
                >
                  오늘의 문제 풀기
                </button>
                <a
                  href="#workbooks"
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-600 bg-neutral-950/70 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-400"
                >
                  문제집 둘러보기
                </a>
              </div>
            </header>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {learningSummaryCards.map((card) => (
                <article
                  key={card.label}
                  className={`rounded-xl border p-4 ${
                    card.tone === "emerald"
                      ? "border-emerald-700/50 bg-emerald-950/20"
                      : card.tone === "fuchsia"
                        ? "border-fuchsia-700/50 bg-fuchsia-950/20"
                        : "border-sky-700/50 bg-sky-950/20"
                  }`}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                    {card.label}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-neutral-50">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">{card.helper}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-3 lg:grid-cols-2">
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3">
            <h2 className="text-sm font-semibold text-neutral-100">
              AWS·SAA 예상문제 덤프(문제집)
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400">
              실제 시험 문항을 그대로 옮긴 자료가 아니라, 출제 범위와 유형을 바탕으로{" "}
              <strong className="font-medium text-neutral-300">
                자체 제작해 축적한 예상문제 덤프
              </strong>
              입니다.{" "}
              <strong className="font-medium text-neutral-300">
                aws 덤프·saa 덤프
              </strong>
              로 찾아오셔도 같은 의미의 한국어 문제집·연습 화면으로 이용할 수 있습니다.
            </p>
          </section>

          <article className="rounded-xl border border-amber-700/50 bg-amber-950/20 px-4 py-3">
            <p className="text-xs font-semibold text-amber-200">
              현재 테스트 버전 안내
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-amber-100/90">
              데이터 손실 및 보안 이슈에 유의해주세요. 개선사항은 오픈채팅 또는
              메일로 전달해주시면 감사하겠습니다.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Link
                href={OPEN_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-amber-500/70 bg-amber-950/40 px-2 py-1 text-[11px] text-amber-100"
              >
                오픈채팅
              </Link>
              <button
                type="button"
                onClick={() => void onCopyEmail()}
                className="cursor-pointer rounded border border-neutral-600 bg-black/30 px-2 py-1 text-[11px] text-neutral-200"
              >
                메일
              </button>
              {copyMessage ? (
                <span className="text-[11px] text-sky-300">{copyMessage}</span>
              ) : null}
            </div>
          </article>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-fuchsia-700/50 bg-fuchsia-950/20 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.025)] lg:col-span-2">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-fuchsia-200">
                    AI 약점 분석
                  </h2>
                  <span className="rounded-full border border-fuchsia-600/50 bg-fuchsia-950/50 px-2 py-0.5 text-[10px] text-fuchsia-100/80">
                    최근 50문제 기준
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-200">
                  {isLoggedIn
                    ? weaknessCommentLoading
                      ? "최근 풀이 기록을 바탕으로 AI 약점분석을 불러오는 중입니다..."
                      : weaknessComment.trim().length > 0
                        ? weaknessComment
                        : weaknessProgress && !weaknessProgress.ready ? (
                          <>
                            AI 약점 코멘트는 최근{" "}
                            {weaknessProgress.requiredAttemptCount}문제 풀이
                            기록이 쌓인 뒤 제공됩니다. (현재{" "}
                            {weaknessProgress.attemptCount}/
                            {weaknessProgress.requiredAttemptCount})
                          </>
                        ) : (
                          "풀이 기록이 쌓이면 최근 성장 흐름을 반영한 AI 약점 코멘트를 보여드립니다."
                        )
                    : "로그인하면 최근 풀이 기록을 바탕으로 AI 약점 분석을 볼 수 있습니다."}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-fuchsia-100/80">
                  {isLoggedIn && weaknessProgress ? (
                    weaknessProgress.ready ? (
                      <>
                        최근 {weaknessProgress.attemptCount}문제 풀이 기록을
                        기준으로 약점 분석을 제공하고 있습니다.
                      </>
                    ) : (
                      <>
                        AI 약점분석까지{" "}
                        {weaknessProgress.remainingAttemptCount}문제 남았습니다.
                        현재 {weaknessProgress.attemptCount}/
                        {weaknessProgress.requiredAttemptCount}문제 풀이 기록이
                        쌓였습니다.
                      </>
                    )
                  ) : (
                    "AI 약점분석은 최근 50문제 풀이 기록이 쌓이면 제공됩니다."
                  )}
                </p>
              </div>
              {!isLoggedIn ? (
                <Link
                  href="/login"
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-fuchsia-500/70 bg-fuchsia-500 px-4 py-2 text-xs font-semibold text-fuchsia-950 transition hover:bg-fuchsia-400"
                >
                  유사 문제 풀기
                </Link>
              ) : weaknessCommentLoading ? (
                <span
                  title="약점 분석 정보를 불러오는 중입니다."
                  aria-disabled
                  className="inline-flex shrink-0 cursor-not-allowed items-center justify-center rounded-lg border border-fuchsia-700/40 bg-fuchsia-950/40 px-4 py-2 text-xs font-semibold text-fuchsia-200/60"
                >
                  유사 문제 풀기
                </span>
              ) : weaknessProgress?.ready ? (
                <Link
                  href="/Quiz?recommended=weakness"
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-fuchsia-500/70 bg-fuchsia-500 px-4 py-2 text-xs font-semibold text-fuchsia-950 transition hover:bg-fuchsia-400"
                >
                  유사 문제 풀기
                </Link>
              ) : (
                <span
                  title={
                    weaknessProgress
                      ? `최근 ${weaknessProgress.requiredAttemptCount}문제 기록을 채운 뒤 이용할 수 있습니다.`
                      : "풀이 기록을 불러오지 못했습니다."
                  }
                  aria-disabled
                  className="inline-flex shrink-0 cursor-not-allowed items-center justify-center rounded-lg border border-fuchsia-700/40 bg-fuchsia-950/40 px-4 py-2 text-xs font-semibold text-fuchsia-200/60"
                >
                  유사 문제 풀기
                </span>
              )}
            </div>
          </section>
          {renderWeakCategoryList(
            "내가 자주 틀리는 유형",
            myWeakCategories,
            isLoggedIn
              ? "아직 누적된 풀이 기록이 없습니다."
              : "로그인하면 내 약점 유형을 볼 수 있습니다.",
            weakCategoriesLoading,
          )}
          {renderWeakCategoryList(
            "전체 이용자가 자주 틀리는 유형",
            globalWeakCategories,
            "아직 누적된 풀이 기록이 없습니다.",
            weakCategoriesLoading,
          )}
        </section>

        <section id="workbooks" className="space-y-3">
          <div className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-100">
                문제집 선택
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                최신 문제집을 먼저 보여줍니다. 필요한 문제집은 제목으로
                검색하세요.
              </p>
            </div>
            <div className="w-full sm:max-w-sm">
              <label htmlFor="main-search" className="sr-only">
                문제집 검색
              </label>
              <input
                id="main-search"
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value.trim()) {
                    trackVisitEvent("search_input");
                  }
                }}
                placeholder="문제집 제목 검색 (예: SAA)"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none ring-sky-600/40 focus:border-sky-500 focus:ring-2"
              />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
            <div className="grid gap-4">
              <section className="flex min-h-0 flex-col rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
                <h2 className="shrink-0 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  공지
                </h2>
                <ul className="mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5 text-sm leading-relaxed text-neutral-300">
                  {noticePreview.length > 0 ? (
                    noticePreview.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2"
                      >
                        <p className="text-xs font-medium text-neutral-200">
                          {item.pinned ? (
                            <span className="mr-1 text-amber-500/90">
                              [필독]
                            </span>
                          ) : null}
                          {item.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-neutral-400">
                          {item.body}
                        </p>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-md border border-dashed border-neutral-700 px-2.5 py-4 text-center text-xs text-neutral-500">
                      등록된 공지가 없습니다.
                    </li>
                  )}
                </ul>
                <Link
                  href="/notice"
                  className="mt-2 shrink-0 text-center text-xs text-sky-400 underline-offset-2 hover:text-sky-300 hover:underline"
                >
                  공지 더보기 →
                </Link>
              </section>

              <section className="flex min-h-0 flex-col rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  {SITE_CERT_GUIDE.title}
                </h2>
                <ul className="mt-2 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5">
                  {SITE_CERT_GUIDE.groups.map((group) => (
                    <li
                      key={group.cert}
                      className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2"
                    >
                      <p className="text-xs font-semibold text-neutral-200">
                        {group.cert}
                      </p>
                      <p className="mt-0.5 text-[11px] text-neutral-500">
                        {group.note}
                      </p>
                      <Link
                        href={group.href}
                        className="mt-2 inline-flex rounded-md border border-neutral-600 px-2 py-1 text-xs text-sky-300 transition hover:border-sky-500/70 hover:bg-neutral-900 hover:text-sky-200"
                      >
                        가이드 보러가기 →
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={SITE_CERT_GUIDE.officialDocs.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 shrink-0 text-xs text-sky-400 underline-offset-2 hover:text-sky-300 hover:underline"
                >
                  {SITE_CERT_GUIDE.officialDocs.label} →
                </Link>
              </section>
            </div>

            <section className="flex min-h-[520px] flex-col rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    문제집
                  </h2>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    검색어와 일치하는 문제집 목록입니다.
                  </p>
                </div>
                {!search.trim() && filteredWorkbooks.length > 12 ? (
                  <span className="rounded-full border border-neutral-700 bg-neutral-950 px-2 py-0.5 text-[10px] text-neutral-500">
                    최근 12개 표시
                  </span>
                ) : null}
              </div>

              <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-0.5">
                {filteredWorkbooks.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-neutral-700 px-2 py-8 text-center text-xs text-neutral-500">
                    검색 결과가 없습니다.
                  </p>
                ) : (
                  <ul className="grid gap-2">
                    {displayedWorkbooks.map((workbook) => {
                      const solved = solvedWorkbookIds.includes(workbook.id);
                      const accuracy = workbookAccuracyMap[workbook.id];
                      return (
                        <li
                          key={workbook.id}
                          className="rounded-xl border border-neutral-800 bg-neutral-950/70 px-3 py-3 transition hover:border-neutral-700"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-400">
                                  {workbook.certificationType}
                                </span>
                                {solved ? (
                                  <span className="rounded-full border border-emerald-500/40 bg-emerald-950/40 px-2 py-0.5 text-[10px] text-emerald-300">
                                    완료
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-2 text-sm font-semibold leading-snug text-neutral-100">
                                {workbook.title}
                              </p>
                              <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                                {workbook.summary}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-500">
                                <span className="text-sky-300/90">
                                  평균 정답률{" "}
                                  {typeof accuracy === "number"
                                    ? `${accuracy.toFixed(1)}%`
                                    : "-"}
                                </span>
                                <span>
                                  수정일 {formatDateTimeSeoul(workbook.updatedAt)}
                                </span>
                              </div>
                            </div>
                            <Link
                              href={
                                isLoggedIn
                                  ? `/Quiz?workbookId=${workbook.id}`
                                  : "/login"
                              }
                              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-amber-500/70 bg-amber-500 px-3 py-2 text-xs font-semibold text-amber-950 transition hover:bg-amber-400"
                            >
                              문제 풀기
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </section>

        <section
          className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
          aria-labelledby="home-faq-heading"
        >
          <h2
            id="home-faq-heading"
            className="text-sm font-semibold text-neutral-100"
          >
            자주 묻는 질문 (AWS SAA·예상문제 덤프)
          </h2>
          <dl className="mt-4 space-y-5">
            {SITE_FAQ_ITEMS.map((item) => (
              <div key={item.question}>
                <dt className="text-sm font-medium leading-snug text-neutral-200">
                  {item.question}
                </dt>
                <dd className="mt-2 text-xs leading-relaxed text-neutral-400">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}
