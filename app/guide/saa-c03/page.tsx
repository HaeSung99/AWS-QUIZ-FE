import type { Metadata } from "next";
import Link from "next/link";
import { SITE_ORIGIN, SITE_OG_IMAGE_ALT, SITE_SEARCH_PHRASE_VARIANTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "SAA-C03 가이드",
  description:
    "AWS Solutions Architect Associate(SAA-C03) 시험 준비 참고 링크 모음. SAA 퀴즈·문제와 함께 보면 좋은 주제별 정리. AWS SAA 준비, 아키텍트 자격증 학습.",
  keywords: [
    "SAA-C03",
    "AWS SAA",
    "aws saa",
    "AWS saa",
    "Solutions Architect Associate",
    "AWS SAA 준비",
    "AWS SAA 퀴즈",
    "AWS 아키텍트",
    ...SITE_SEARCH_PHRASE_VARIANTS,
  ],
  alternates: { canonical: `${SITE_ORIGIN}/guide/saa-c03` },
  openGraph: {
    title: "SAA-C03 가이드 | AWS Quiz KR",
    description:
      "AWS SAA-C03 시험 준비 참고 링크. aws saa·AWS SAA 퀴즈는 메인 문제집에서 연습할 수 있습니다.",
    url: `${SITE_ORIGIN}/guide/saa-c03`,
    images: [{ url: `${SITE_ORIGIN}/logo.png`, alt: SITE_OG_IMAGE_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAA-C03 가이드 | AWS Quiz KR",
    description:
      "AWS Solutions Architect Associate 참고 링크 모음. 한국어 문제집·퀴즈는 메인에서.",
    images: { url: `${SITE_ORIGIN}/logo.png`, alt: SITE_OG_IMAGE_ALT },
  },
};

const SAA_GUIDE_LINKS = [
  { id: "saa-s3", label: "S3 가이드", href: "https://velog.io/@haesung/AWS-SAA-C03-S3" },
  {
    id: "saa-storage",
    label: "스토리지 가이드",
    href: "https://velog.io/@haesung/AWS-SAA-C03-스토리지",
  },
  {
    id: "saa-transfer",
    label: "데이터 전송 가이드",
    href: "https://velog.io/@haesung/AWS-SAA-C03-데이터-전송",
  },
  {
    id: "saa-database",
    label: "데이터베이스 가이드",
    href: "https://velog.io/@haesung/AWS-SAA-C03-데이터베이스",
  },
  {
    id: "saa-compute",
    label: "컴퓨팅 가이드",
    href: "https://velog.io/@haesung/AWS-SAA-C03-컴퓨팅",
  },
  {
    id: "saa-network",
    label: "네트워크 가이드 #1 ",
    href: "https://velog.io/@haesung/AWS-SAA-C03-네트워크",
  },
  {
    id: "saa-network-2",
    label: "네트워크 가이드 #2",
    href: "https://velog.io/@haesung/AWS-SAA-C03-네트워크-2",
  },
];

export default function SaaGuidePage() {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-neutral-100">
      <p className="sr-only">
        보충 안내. SAA-C03 참고 링크 목록 페이지입니다. aws saa·AWS SAA 키워드로
        메인 퀴즈·문제집과 연결됩니다.
      </p>
      <div className="mx-auto w-full max-w-4xl rounded-xl border border-neutral-700 bg-neutral-950/80 p-6">
        <h1 className="text-xl font-semibold">SAA-C03 가이드</h1>
        <p className="mt-2 text-sm text-neutral-400">
          아래 내용은 학습을 돕기 위한 참고용 가이드입니다.
        </p>

        <ul className="mt-5 space-y-2">
          {SAA_GUIDE_LINKS.map((guide) => (
            <li key={guide.id}>
              <Link
                href={guide.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-sky-300 transition hover:border-sky-500/60 hover:text-sky-200"
              >
                {guide.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-md border border-neutral-600 px-3 py-2 text-sm text-neutral-200 hover:border-neutral-500"
        >
          ← 메인으로
        </Link>
      </div>
    </main>
  );
}
