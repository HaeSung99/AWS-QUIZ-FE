import type { Metadata } from "next";
import HomeClient from "./home-client";
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_KEYWORDS,
  SITE_ORIGIN,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "AWS 퀴즈·문제집 (AWS Quiz KR)",
  description:
    "AWS 자격증 준비용 한국어 퀴즈·문제집. 객관식 문제, 문제집 검색, 정답률·채점·풀이 완료 확인. " +
    "실제 시험 덤프가 아닌 학습용 문제로 AWS 문제, SAA 퀴즈, SAA 준비, 클라우드 시험 연습·모의고사에 가깝게 연습하고 싶을 때. AWS Quiz KR.",
  keywords: SITE_KEYWORDS,
  alternates: {
    canonical: SITE_ORIGIN,
  },
  openGraph: {
    title: "AWS 퀴즈·문제집 (AWS Quiz KR)",
    description: SITE_DEFAULT_DESCRIPTION,
    url: SITE_ORIGIN,
    siteName: "AWS Quiz KR",
    locale: "ko_KR",
    type: "website",
    images: [{ url: `${SITE_ORIGIN}/logo.png` }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_DEFAULT_TITLE,
    description:
      "AWS 자격증 한국어 퀴즈·문제집. AWS 문제, 시험 준비, AWS Quiz KR.",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
