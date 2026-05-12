import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { HeaderAuth } from "@/components/header-auth";
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_KEYWORDS,
  SITE_OG_IMAGE_ALT,
  SITE_ORIGIN,
  SITE_SEARCH_PHRASE_VARIANTS,
} from "@/lib/seo";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: SITE_ORIGIN,
      name: "AWS Quiz KR",
      alternateName: [
        "AWS Quiz KR",
        "awsquizkr",
        "AWS 퀴즈 KR",
        ...SITE_SEARCH_PHRASE_VARIANTS,
      ],
      description: SITE_DEFAULT_DESCRIPTION,
      inLanguage: "ko-KR",
      publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_ORIGIN}/#organization`,
      name: "AWS Quiz KR",
      url: SITE_ORIGIN,
      logo: `${SITE_ORIGIN}/logo.png`,
    },
    {
      "@type": "WebApplication",
      name: "AWS Quiz KR",
      url: SITE_ORIGIN,
      description: SITE_DEFAULT_DESCRIPTION,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web browser",
      browserRequirements: "Requires JavaScript. 한국어 UI.",
      inLanguage: "ko-KR",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "KRW",
      },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: SITE_DEFAULT_TITLE,
    template: "%s | AWS Quiz KR",
  },
  description: SITE_DEFAULT_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  openGraph: {
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    url: SITE_ORIGIN,
    siteName: "AWS Quiz KR",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: `${SITE_ORIGIN}/logo.png`,
        alt: SITE_OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION.slice(0, 200),
    images: {
      url: `${SITE_ORIGIN}/logo.png`,
      alt: SITE_OG_IMAGE_ALT,
    },
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    other: {
      "naver-site-verification": "5d2a1342267a275219e51b8bacc43f58feef2caf",
    },
  },
  other: {
    "google-adsense-account": "ca-pub-6105668975420119",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-neutral-800 bg-black/90 px-4 py-3 backdrop-blur-sm">
          <Link href="/" className="text-base font-semibold text-neutral-100 transition hover:text-sky-300">
            AWS Quiz KR
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
