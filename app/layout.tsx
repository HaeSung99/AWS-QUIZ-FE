import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { HeaderAuth } from "@/components/header-auth";

export const metadata: Metadata = {
  title: "AWS 문제 풀이 사이트",
  description: "AWS 문제 풀이 사이트",
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
