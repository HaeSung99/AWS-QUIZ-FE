import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_ORIGIN } from "@/lib/seo";

export const metadata: Metadata = {
  title: "회원가입",
  description:
    "AWS Quiz KR 회원가입. 목표 자격증 선택 후 한국어 문제집·퀴즈를 이용할 수 있습니다.",
  alternates: { canonical: `${SITE_ORIGIN}/signup` },
  robots: { index: false, follow: true },
};

export default function SignupLayout({ children }: { children: ReactNode }) {
  return children;
}
