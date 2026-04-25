import type { Metadata } from "next";
import Link from "next/link";
import { SITE_ORIGIN } from "@/lib/seo";

export const metadata: Metadata = {
  title: "공지사항",
  description:
    "AWS Quiz KR 공지사항. 서비스 안내·점검·업데이트. AWS 자격증 퀴즈·문제집 이용 시 참고하세요.",
  alternates: { canonical: `${SITE_ORIGIN}/notice` },
};

type NoticeItem = { id: string; title: string; body: string; pinned?: boolean };

export default async function NoticePage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  let items: NoticeItem[] = [];

  if (apiBaseUrl) {
    try {
      const res = await fetch(`${apiBaseUrl}/public/notices`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as unknown;
        if (Array.isArray(data)) {
          items = data as NoticeItem[];
        }
      }
    } catch {
      items = [];
    }
  }

  return (
    <main className="flex flex-1 flex-col bg-black px-4 py-8 text-neutral-100">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold text-neutral-100">공지사항</h1>
          <Link
            href="/"
            className="shrink-0 text-sm text-sky-400 underline-offset-2 hover:underline"
          >
            ← 메인으로
          </Link>
        </div>
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-700 px-4 py-8 text-center text-sm text-neutral-500">
            등록된 공지가 없습니다.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-neutral-700/80 bg-neutral-900/60 px-4 py-3"
              >
                <p className="text-sm font-medium text-neutral-100">
                  {item.pinned ? (
                    <span className="mr-1.5 text-amber-500/90">[필독]</span>
                  ) : null}
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
