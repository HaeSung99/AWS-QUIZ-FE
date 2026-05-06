import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_ORIGIN } from "@/lib/seo";

export const metadata: Metadata = {
  title: "비밀번호 찾기",
  description:
    "AWS Quiz KR 비밀번호 재설정. 이메일 인증으로 새 비밀번호를 설정합니다.",
  alternates: { canonical: `${SITE_ORIGIN}/forgot-password` },
  robots: { index: false, follow: true },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
