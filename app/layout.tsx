import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { HeaderAuth } from "@/components/header-auth";

export const metadata: Metadata = {
  metadataBase: new URL("https://awsquizkr.com"),
  title: "AWS Quiz KR - AWS 자격증 준비를 위한 실전 퀴즈",
  description:
    "AWS 자격증(SAA, CLF 등) 합격을 위한 한국어 퀴즈 서비스입니다. 지금 바로 문제를 풀고 실력을 점검하세요!",
  openGraph: {
    title: "AWS Quiz KR",
    description: "AWS 자격증 준비는 여기서!",
    url: "https://awsquizkr.com",
    siteName: "AWS Quiz KR",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://awsquizkr.com/logo.png",
      },
    ],
  },
  verification: {
    other: {
      "naver-site-verification": "5d2a1342267a275219e51b8bacc43f58feef2caf",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-black text-neutral-100">
        <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-neutral-800 bg-black/90 px-4 py-3 backdrop-blur-sm">
          <Link href="/" className="text-base font-semibold text-neutral-100 transition hover:text-sky-300">
            AWS 문풀
          </Link>
          <div className="flex items-center gap-2">
            <HeaderAuth />
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
