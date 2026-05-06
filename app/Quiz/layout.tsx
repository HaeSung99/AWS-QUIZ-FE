import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_ORIGIN } from "@/lib/seo";

export const metadata: Metadata = {
  title: "문제 풀이",
  description:
    "AWS 자격증 문제집 퀴즈 풀이·채점 화면. SAA·CLF 등 선택한 문제집의 객관식 문항을 순서대로 풀고 제출하면 결과와 정답률 반영 안내를 확인할 수 있습니다.",
  alternates: { canonical: `${SITE_ORIGIN}/Quiz` },
  robots: { index: false, follow: true },
};

export default function QuizLayout({ children }: { children: ReactNode }) {
  return children;
}
