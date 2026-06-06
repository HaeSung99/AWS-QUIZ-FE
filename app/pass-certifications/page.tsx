"use client";

import { useMemo, useState } from "react";

const PAGE_SIZE = 8;

const PASS_CERTIFICATIONS = [
  {
    id: 1,
    badgeImageSrc: "/img/aws-certified-solutions-architect-associate.png",
    verificationUrl: "https://www.credly.com/badges/fd00abd0-fa03-48b7-86fe-2d6a49d813bb/public_url",
    passedAt: "2026.05.31",
    review: "똑같은 상황 문제 15개, 같은 유형 문제 30개, 유사 유형 문제 15개 정도 출제되어 여유롭게 해결할 수 있었습니다.",
  },
  // {
  //   id: 2,
  //   badgeImageSrc: "/img/aws-certified-solutions-architect-associate.png",
  //   verificationUrl: "https://example.com/pass-certification/2",
  //   review: "문제 풀이 후 오답을 바로 확인할 수 있어서 시험 직전 정리에 도움이 됐어요.",
  // },
  // {
  //   id: 3,
  //   badgeImageSrc: "/img/aws-certified-solutions-architect-associate.png",
  //   verificationUrl: "https://example.com/pass-certification/3",
  //   review: "비슷한 유형을 반복해서 풀다 보니 서비스별 차이가 자연스럽게 정리됐습니다.",
  // },
  // {
  //   id: 4,
  //   badgeImageSrc: "/img/aws-certified-solutions-architect-associate.png",
  //   verificationUrl: "https://example.com/pass-certification/4",
  //   review: "헷갈리는 운영 시나리오를 문제로 익히는 데 가장 효과적이었습니다.",
  // },
  // {
  //   id: 5,
  //   badgeImageSrc: "/img/aws-certified-solutions-architect-associate.png",
  //   verificationUrl: "https://example.com/pass-certification/5",
  //   review: "긴 지문에서 핵심 조건을 찾는 연습을 꾸준히 할 수 있었습니다.",
  // },
  // {
  //   id: 6,
  //   badgeImageSrc: "/img/aws-certified-solutions-architect-associate.png",
  //   verificationUrl: "https://example.com/pass-certification/6",
  //   review: "CI/CD와 운영 자동화 관련 문제를 반복해서 보며 감을 잡았습니다.",
  // },
  // {
  //   id: 7,
  //   badgeImageSrc: "/img/aws-certified-solutions-architect-associate.png",
  //   verificationUrl: "https://example.com/pass-certification/7",
  //   review: "보안 서비스별 선택 기준을 오답 중심으로 정리할 수 있었습니다.",
  // },
  // {
  //   id: 8,
  //   badgeImageSrc: "/img/aws-certified-solutions-architect-associate.png",
  //   verificationUrl: "https://example.com/pass-certification/8",
  //   review: "네트워크 문제를 많이 풀어보면서 라우팅과 연결 옵션이 정리됐습니다.",
  // },
  // {
  //   id: 9,
  //   badgeImageSrc: "/img/aws-certified-solutions-architect-associate.png",
  //   verificationUrl: "https://example.com/pass-certification/9",
  //   review: "서비스 이름만 외우는 게 아니라 상황별 선택 기준을 잡을 수 있었어요.",
  // },
] as const;

export default function PassCertificationsPage() {
  const [pageIndex, setPageIndex] = useState(0);
  const totalPages = Math.ceil(PASS_CERTIFICATIONS.length / PAGE_SIZE);

  const visibleCertifications = useMemo(() => {
    const start = pageIndex * PAGE_SIZE;
    return PASS_CERTIFICATIONS.slice(start, start + PAGE_SIZE);
  }, [pageIndex]);

  return (
    <main className="flex-1 bg-neutral-950 px-4 py-8 text-neutral-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-2xl shadow-black/30 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-300">AWS Quiz KR</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                합격 인증
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageIndex((current) => Math.max(current - 1, 0))}
                disabled={pageIndex === 0}
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                이전
              </button>
              <span className="min-w-14 text-center text-sm text-neutral-400">
                {pageIndex + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPageIndex((current) => Math.min(current + 1, totalPages - 1))
                }
                disabled={pageIndex >= totalPages - 1}
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                다음
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {visibleCertifications.map((item) => (
              <article
                key={item.id}
                className="flex aspect-[1/2] flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-black/50"
              >
                <div className="flex min-h-0 flex-[3] items-center justify-center bg-neutral-950 p-3">
                  <img
                    src={item.badgeImageSrc}
                    alt="합격 뱃지"
                    className="h-full w-full rounded-xl object-contain"
                  />
                </div>
                <div className="flex flex-[2] flex-col justify-between gap-4 border-t border-neutral-800 p-4">
                  <p className="line-clamp-5 break-keep text-[15px] font-medium leading-7 tracking-[-0.01em] text-neutral-100">
                    {item.review}
                  </p>
                  <div className="flex items-end justify-between gap-3">
                    <time className="shrink-0 text-xs font-medium text-neutral-500">
                      {item.passedAt}
                    </time>
                    <a
                      href={item.verificationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-sky-500/70 bg-sky-950/50 px-3 py-1.5 text-xs font-semibold tracking-[-0.01em] text-sky-100 transition hover:border-sky-300 hover:text-white"
                    >
                      뱃지 인증 확인하기
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
