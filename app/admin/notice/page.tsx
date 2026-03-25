"use client";

import axios from "axios";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState, useSyncExternalStore } from "react";

type AuthUser = { id: number; email: string; name: string; role: "user" | "admin" };
type Notice = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt?: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY;
const subscribeNoop = () => () => {};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR");
};

export default function AdminNoticePage() {
  const isHydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");
  const [noticePinned, setNoticePinned] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [editingNoticeId, setEditingNoticeId] = useState("");

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

  const token = auth.token;

  const loadNotices = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get<Notice[]>(`${API_BASE_URL}/admin/notices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotices(data);
    } catch {
      setNotices([]);
    }
  };

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const { data } = await axios.get<Notice[]>(`${API_BASE_URL}/admin/notices`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotices(data);
      } catch {
        setNotices([]);
      }
    })();
  }, [token]);

  const onCreateNotice = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    setNoticeMessage("");
    try {
      if (editingNoticeId) {
        await axios.patch(
          `${API_BASE_URL}/admin/notices/${editingNoticeId}`,
          { title: noticeTitle, body: noticeBody, pinned: noticePinned },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/admin/notices`,
          { title: noticeTitle, body: noticeBody, pinned: noticePinned },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      setNoticeTitle("");
      setNoticeBody("");
      setNoticePinned(false);
      setEditingNoticeId("");
      setNoticeMessage(editingNoticeId ? "공지 수정 완료" : "공지 저장 완료");
      await loadNotices();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = Array.isArray(err.response?.data?.message)
          ? err.response?.data?.message.join(", ")
          : err.response?.data?.message ?? err.message;
        setNoticeMessage(message || "공지 저장 실패");
        return;
      }
      setNoticeMessage("공지 저장 실패");
    }
  };

  const onDeleteNotice = async (noticeId: string) => {
    if (!token) return;
    setNoticeMessage("");
    try {
      await axios.delete(`${API_BASE_URL}/admin/notices/${noticeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (editingNoticeId === noticeId) {
        setEditingNoticeId("");
        setNoticeTitle("");
        setNoticeBody("");
        setNoticePinned(false);
      }
      await loadNotices();
      setNoticeMessage("공지 삭제 완료");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = Array.isArray(err.response?.data?.message)
          ? err.response?.data?.message.join(", ")
          : err.response?.data?.message ?? err.message;
        setNoticeMessage(message || "공지 삭제 실패");
        return;
      }
      setNoticeMessage("공지 삭제 실패");
    }
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
          <Link href="/admin" className="rounded-md border border-neutral-700 px-3 py-2 text-sm">
            통계
          </Link>
          <Link href="/admin/notice" className="rounded-md border border-sky-500 bg-sky-950/30 px-3 py-2 text-sm text-sky-200">
            공지
          </Link>
          <Link href="/admin/workbook" className="rounded-md border border-neutral-700 px-3 py-2 text-sm">
            문제집
          </Link>
        </div>
      </aside>

      <section className="flex-1 p-6">
        <div className="mx-auto w-full max-w-3xl rounded-lg border border-neutral-700 bg-neutral-950/70 p-6">
          <h2 className="text-lg font-semibold">{editingNoticeId ? "공지 수정" : "공지 작성"}</h2>
          <form onSubmit={onCreateNotice} className="mt-4 flex flex-col gap-3">
            <input
              type="text"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              placeholder="공지 제목"
              className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm"
              required
            />
            <textarea
              value={noticeBody}
              onChange={(e) => setNoticeBody(e.target.value)}
              placeholder="공지 내용"
              className="min-h-28 rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm"
              required
            />
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" checked={noticePinned} onChange={(e) => setNoticePinned(e.target.checked)} />
              상단 고정
            </label>
            {noticeMessage ? <p className="text-sm text-amber-300">{noticeMessage}</p> : null}
            <div className="flex gap-2">
              <button type="submit" className="rounded-md border border-neutral-500 px-3 py-2 text-sm">
                {editingNoticeId ? "공지 수정 저장" : "공지 저장"}
              </button>
              {editingNoticeId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNoticeId("");
                    setNoticeTitle("");
                    setNoticeBody("");
                    setNoticePinned(false);
                  }}
                  className="rounded-md border border-neutral-500 px-3 py-2 text-sm"
                >
                  수정 취소
                </button>
              ) : null}
            </div>
          </form>

          <div className="mt-5 space-y-2">
            {notices.map((notice) => (
              <div key={notice.id} className="rounded-md border border-neutral-700 bg-black/40 px-3 py-3 text-sm">
                <p className="font-medium text-neutral-100">
                  {notice.pinned ? <span className="mr-1 text-amber-400">[고정]</span> : null}
                  {notice.title}
                </p>
                <p className="mt-1 text-neutral-400">{notice.body}</p>
                <p className="mt-1 text-xs text-neutral-500">작성일: {formatDateTime(notice.createdAt)}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNoticeId(notice.id);
                      setNoticeTitle(notice.title);
                      setNoticeBody(notice.body);
                      setNoticePinned(notice.pinned);
                    }}
                    className="rounded-md border border-neutral-500 px-2 py-1 text-xs"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDeleteNotice(notice.id)}
                    className="rounded-md border border-rose-500/70 bg-rose-950/30 px-2 py-1 text-xs text-rose-200"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
