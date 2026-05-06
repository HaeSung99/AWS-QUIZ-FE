import type { Metadata } from "next";
import Link from "next/link";
import { SITE_ORIGIN } from "@/lib/seo";

export const metadata: Metadata = {
  title: "SAA-C03 가이드 | aws saa·AWS SAA·예상문제 덤프 연습",
  description:
    "AWS Solutions Architect Associate(SAA-C03) 준비 참고 링크 모음. aws saa, AWS SAA 예상문제 덤프·문제집과 함께 보기 좋은 주제별 정리입니다. 실제 시험 원문 복제가 아닌 자체 제작 문항 안내.",
  keywords: [
    "SAA-C03",
    "AWS SAA",
    "aws saa",
    "saa 덤프",
    "예상문제 덤프",
    "Solutions Architect Associate",
    "AWS SAA 준비",
    "AWS SAA 퀴즈",
    "AWS 아키텍트",
  ],
  alternates: { canonical: `${SITE_ORIGIN}/guide/saa-c03` },
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
      <div className="mx-auto w-full max-w-4xl rounded-xl border border-neutral-700 bg-neutral-950/80 p-6">
        <h1 className="text-xl font-semibold">SAA-C03 가이드</h1>
        <p className="mt-2 text-sm text-neutral-400">
          aws saa·AWS SAA 시험 준비 참고 링크입니다. 메인의 예상문제 덤프(문제집)는 실제 시험 원문을
          그대로 옮긴 것이 아니라 자체 제작 문항이며, 가이드와 함께 보시면 좋습니다.
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
