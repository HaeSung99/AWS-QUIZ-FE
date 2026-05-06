import type { Metadata } from "next";
import HomeClient from "./home-client";
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_KEYWORDS,
  SITE_OG_IMAGE_ALT,
  SITE_ORIGIN,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: SITE_DEFAULT_TITLE,
  description: SITE_DEFAULT_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  alternates: {
    canonical: SITE_ORIGIN,
  },
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
};

export default function HomePage() {
  return <HomeClient />;
}
