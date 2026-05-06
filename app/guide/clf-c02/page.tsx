import type { Metadata } from "next";
import Link from "next/link";
import { SITE_ORIGIN, SITE_OG_IMAGE_ALT } from "@/lib/seo";

export const metadata: Metadata = {
  title: "CLF-C02 가이드",
  description:
    "AWS Cloud Practitioner(CLF-C02) 준비 페이지. 기본 개념·요금·보안 등 가이드 예정. CLF 퀴즈·AWS 입문 시험 준비.",
  keywords: ["CLF-C02", "AWS CLF", "Cloud Practitioner", "AWS 입문", "AWS 기초 시험"],
  alternates: { canonical: `${SITE_ORIGIN}/guide/clf-c02` },
  openGraph: {
    title: "CLF-C02 가이드 | AWS Quiz KR",
    description:
      "AWS Cloud Practitioner(CLF-C02) 참고 페이지. CLF 한국어 퀴즈는 메인 문제집에서.",
    url: `${SITE_ORIGIN}/guide/clf-c02`,
    images: [{ url: `${SITE_ORIGIN}/logo.png`, alt: SITE_OG_IMAGE_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CLF-C02 가이드 | AWS Quiz KR",
    description: "AWS 입문 자격증 CLF-C02 준비 안내. 한국어 문제집은 메인에서.",
    images: { url: `${SITE_ORIGIN}/logo.png`, alt: SITE_OG_IMAGE_ALT },
  },
};

export default function ClfGuidePage() {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-neutral-100">
      <p className="sr-only">
        보충 안내. CLF-C02 Cloud Practitioner 참고 페이지입니다. AWS CLF 퀴즈는 메인
        문제집과 연결됩니다.
      </p>
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-neutral-700 bg-neutral-950/80 p-6 text-center">
        <h1 className="text-xl font-semibold">CLF-C02 가이드</h1>
        <p className="mt-3 text-sm text-neutral-400">준비중입니다.</p>
        <p className="mt-1 text-xs text-neutral-500">
          추후 Cloud 기본 개념/요금/보안/공유 책임 모델 중심으로 업데이트할 예정입니다.
        </p>

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
