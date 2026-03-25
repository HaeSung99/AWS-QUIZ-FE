"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY;
const NOTICE_HOME_MAX = 4;
const SITE_CERT_GUIDE = {
  title: "AWS 자격증 가이드",
  articles: [
    { id: "saa-s3", label: "AWS SAA S3 총 정리", href: "/guide/saa-s3" },
    { id: "saa-vpc", label: "SAA VPC·네트워킹 핵심 정리", href: "/guide/saa-vpc" },
    { id: "dva-lambda", label: "DVA Lambda·이벤트 기반 설계", href: "/guide/dva-lambda" },
    {
      id: "sap-well-architected",
      label: "SAP Well-Architected 요약",
      href: "/guide/sap-well-architected",
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
};
type StoredUser = {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
  solvedWorkbookIds?: string[];
};

const pseudoRandomOrderValue = (id: string) =>
  id.split("").reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 17), 0);

export default function Home() {
  const [search, setSearch] = useState("");
  const [noticeItems, setNoticeItems] = useState<NoticeItem[]>([]);
  const [workbookItems, setWorkbookItems] = useState<WorkbookItem[]>([]);
  const [solvedWorkbookIds, setSolvedWorkbookIds] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    if (search.trim()) return filteredWorkbooks;
    const shuffled = [...filteredWorkbooks].sort(
      (a, b) => pseudoRandomOrderValue(a.id) - pseudoRandomOrderValue(b.id),
    );
    return shuffled.slice(0, 12);
  }, [filteredWorkbooks, search]);

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-neutral-100">
      <div className="mx-auto flex w-full max-w-[81rem] flex-col gap-9">
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
              {SITE_CERT_GUIDE.articles.map((article) => (
                <li key={article.id}>
                  <Link
                    href={article.href}
                    className="block rounded-md border border-transparent px-1 py-1 text-sm text-sky-300/90 transition hover:border-neutral-600 hover:bg-neutral-950/50 hover:text-sky-200"
                  >
                    {article.label}
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
