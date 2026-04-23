"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
type StoredUser = {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
  solvedWorkbookIds?: string[];
};

const workbookLatestTime = (w: WorkbookItem) => {
  const u = w.updatedAt ? new Date(w.updatedAt).getTime() : NaN;
  const c = w.createdAt ? new Date(w.createdAt).getTime() : NaN;
  if (!Number.isNaN(u)) return u;
  if (!Number.isNaN(c)) return c;
  return 0;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [noticeItems, setNoticeItems] = useState<NoticeItem[]>([]);
  const [workbookItems, setWorkbookItems] = useState<WorkbookItem[]>([]);
  const [workbookAccuracyMap, setWorkbookAccuracyMap] = useState<Record<string, number>>({});
  const [solvedWorkbookIds, setSolvedWorkbookIds] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    if (!API_BASE_URL) return;
    void (async () => {
      try {
        const { data } = await axios.get<NoticeItem[]>(`${API_BASE_URL}/public/notices`);
        setNoticeItems(Array.isArray(data) ? data : []);
      } catch {
        setNoticeItems([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!API_BASE_URL) return;
    void (async () => {
      try {
        const { data } = await axios.get<WorkbookItem[]>(`${API_BASE_URL}/public/workbooks`);
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
    if (!API_BASE_URL || typeof window === "undefined") return;
    const saved = localStorage.getItem("aws_quiz_visit_key");
    const clientKey =
      saved ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
    if (!saved) {
      localStorage.setItem("aws_quiz_visit_key", clientKey);
    }
    void axios.post(`${API_BASE_URL}/public/track-visit`, { clientKey }).catch(() => undefined);
  }, []);

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
      } catch {
        setSolvedWorkbookIds([]);
      }

      try {
        const { data } = await axios.get<{ user: StoredUser }>(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const solved = Array.isArray(data.user?.solvedWorkbookIds)
          ? data.user.solvedWorkbookIds
          : [];
        setSolvedWorkbookIds(solved);

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

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-neutral-100">
      <div className="mx-auto flex w-full max-w-[81rem] flex-col gap-9">
        <article className="rounded-md border border-amber-700/60 bg-amber-950/20 px-3 py-2.5">
          <p className="text-xs font-semibold text-amber-200">현재 테스트 버전 안내</p>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-100/90">
            현재 테스트 버전이므로 데이터 손실 및 보안 이슈에 유의해주세요. 문의사항, 도움을 줄 수 있는
            내용, 개선사항, 다양한 조언은 오픈채팅 또는 메일로 전달해주시면 감사하겠습니다.
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
            {copyMessage ? <span className="text-[11px] text-sky-300">{copyMessage}</span> : null}
          </div>
        </article>

        <div className="w-full">
          <label htmlFor="main-search" className="sr-only">
            문제집 검색
          </label>
          <input
            id="main-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="문제집 제목 검색 (예: SAA)"
            className="w-full rounded-lg border border-neutral-600 bg-neutral-950 px-6 py-[1.125rem] text-sm text-neutral-100 placeholder:text-neutral-500 outline-none ring-neutral-500 focus:border-neutral-400 focus:ring-2"
          />
        </div>

        <div className="grid min-h-[780px] grid-cols-[34fr_66fr] grid-rows-2 gap-[1.125rem] rounded-xl border border-neutral-700 bg-neutral-950/80 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <section className="col-start-1 row-start-1 flex min-h-0 flex-col rounded-lg border border-neutral-600/80 bg-neutral-900/60 p-[1.125rem]">
            <h2 className="shrink-0 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              공지
            </h2>
            <ul className="mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5 text-sm leading-relaxed text-neutral-300">
              {noticePreview.length > 0 ? (
                noticePreview.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-md border border-neutral-700/60 bg-neutral-950/40 px-2.5 py-2"
                  >
                    <p className="text-xs font-medium text-neutral-200">
                      {item.pinned ? <span className="mr-1 text-amber-500/90">[필독]</span> : null}
                      {item.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-400">{item.body}</p>
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

          <section className="col-start-1 row-start-2 flex min-h-0 flex-col rounded-lg border border-neutral-600/80 bg-neutral-900/60 p-[1.125rem]">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {SITE_CERT_GUIDE.title}
            </h2>
            <ul className="mt-2 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5">
              {SITE_CERT_GUIDE.groups.map((group) => (
                <li key={group.cert} className="rounded-md border border-neutral-700/70 bg-black/30 px-2 py-2">
                  <p className="text-xs font-semibold text-neutral-200">{group.cert}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-500">{group.note}</p>
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

          <section className="col-start-2 row-span-2 row-start-1 flex min-h-0 flex-col rounded-lg border border-neutral-600/80 bg-neutral-900/60 p-[1.125rem]">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">문제집</h2>
            <p className="mt-1 text-[11px] text-neutral-500">
              검색어와 일치하는 문제집 목록입니다. (미래에 추천/태그 필터 예정)
            </p>

            <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-0.5">
              {filteredWorkbooks.length === 0 ? (
                <p className="rounded-md border border-dashed border-neutral-700 px-2 py-3 text-center text-xs text-neutral-500">
                  검색 결과가 없습니다.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {displayedWorkbooks.map((workbook) => {
                    const solved = solvedWorkbookIds.includes(workbook.id);
                    return (
                      <li
                        key={workbook.id}
                        className="rounded-md border border-neutral-700/80 bg-neutral-950/50 px-2.5 py-2"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-neutral-500">{workbook.certificationType}</p>
                            <p className="text-sm font-medium leading-snug text-neutral-200">
                              {workbook.title}
                              {solved ? (
                                <span className="ml-2 rounded border border-emerald-500/40 bg-emerald-950/40 px-1.5 py-0.5 text-[10px] text-emerald-300">
                                  완료
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
                              {workbook.summary}
                            </p>
                            <p className="mt-0.5 text-[11px] text-sky-300/90">
                              문제집 평균 정답률:{" "}
                              {typeof workbookAccuracyMap[workbook.id] === "number"
                                ? `${workbookAccuracyMap[workbook.id].toFixed(1)}%`
                                : "-"}
                            </p>
                            <p className="mt-0.5 text-[10px] text-neutral-500">
                              작성일 {formatDateTime(workbook.createdAt)} / 수정일{" "}
                              {formatDateTime(workbook.updatedAt)}
                            </p>
                          </div>
                          <Link
                            href={isLoggedIn ? `/Quiz?workbookId=${workbook.id}` : "/login"}
                            className="inline-flex shrink-0 items-center justify-center rounded-md border border-amber-600/50 bg-amber-950/40 px-3 py-1.5 text-xs font-medium text-amber-100 transition hover:border-amber-500 hover:bg-amber-950/70"
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
      </div>
    </main>
  );
}
