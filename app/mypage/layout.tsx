import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_ORIGIN } from "@/lib/seo";

export const metadata: Metadata = {
  title: "마이페이지",
  description:
    "AWS Quiz KR 마이페이지. 목표 자격증·계정 정보 및 비밀번호 변경.",
  alternates: { canonical: `${SITE_ORIGIN}/mypage` },
  robots: { index: false, follow: true },
};

export default function MypageLayout({ children }: { children: ReactNode }) {
  return children;
}
