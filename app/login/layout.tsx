import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_ORIGIN } from "@/lib/seo";

export const metadata: Metadata = {
  title: "로그인",
  description:
    "AWS Quiz KR 로그인. AWS 자격증 한국어 퀴즈·문제집 회원 로그인 화면입니다.",
  alternates: { canonical: `${SITE_ORIGIN}/login` },
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
