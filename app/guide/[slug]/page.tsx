"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;

export default function GuideArticlePage() {
  const params = useParams<{ slug: string }>();
  if (typeof window === "undefined") {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-black px-4 text-neutral-100">
        <p className="text-neutral-400">로그인 확인 중...</p>
      </main>
    );
  }

  if (!ACCESS_TOKEN_KEY || !localStorage.getItem(ACCESS_TOKEN_KEY)) {
    return (
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-black px-4 text-neutral-100">
        <p className="text-neutral-400">로그인 후 접근 가능합니다.</p>
        <Link
          href="/login"
          className="mt-4 text-sm text-sky-400 underline-offset-2 hover:underline"
        >
          로그인하러 가기 →
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-black px-4 text-neutral-100">
      <p className="text-neutral-400">
        가이드 <span className="text-neutral-300">{params.slug}</span> 준비 중입니다.
      </p>
      <Link
        href="/"
        className="mt-4 text-sm text-sky-400 underline-offset-2 hover:underline"
      >
        ← 메인으로
      </Link>
    </main>
  );
}
