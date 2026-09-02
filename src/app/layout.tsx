import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import ChatBot from "@/components/ChatBot";
import ScrollRestoration from "@/components/ScrollRestoration";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { JsonLd } from "@/components/JsonLd";
import MetaPixel from "@/components/MetaPixel";
import {
  localBusinessJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: {
    default:
      "Custom Furniture & Interiors in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture",
    template: "%s | Ananya House of Furniture",
  },
  description:
    "Custom furniture, modular kitchens & wardrobes in Mumbai, Navi Mumbai & Thane. Free site visit, 3D design consultation, in-house manufacturing and professional installation.",
  keywords:
    "custom furniture Mumbai, modular kitchen Mumbai, wardrobe Navi Mumbai, furniture Thane, home interiors Mumbai, PVC furniture Ahmedabad",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title:
      "Custom Furniture & Interiors in Mumbai, Navi Mumbai & Thane | Ananya House of Furniture",
    description:
      "Custom furniture, modular kitchens & wardrobes for Mumbai, Navi Mumbai & Thane. Free site visit and 3D design consultation.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ananya House of Furniture — custom furniture Mumbai, Navi Mumbai & Thane",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ananya House of Furniture | Mumbai, Navi Mumbai & Thane",
    description:
      "Custom furniture, modular kitchens & wardrobes. Free site visit + 3D design consultation.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || "";

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="google-site-verification" content="aDEB0fLtHFpcrTyE1-6C6KP6wK4VHImgKtZpABLHUJA" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
        />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={localBusinessJsonLd()} />
      </head>
      <body>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
        <ChatBot />
        <ScrollRestoration />
        <Analytics />
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
        <MetaPixel />
      </body>
    </html>
  );
}
