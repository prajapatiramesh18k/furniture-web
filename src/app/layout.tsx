import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import ChatBot from "@/components/ChatBot";
import ScrollRestoration from "@/components/ScrollRestoration";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Ananya House of Furniture | Custom Furniture Thane, Maharashtra",
  description:
    "Ananya House of Furniture - Custom furniture manufacturer in Thane, Maharashtra. Best quality wooden furniture at factory-direct prices. 14+ years experience, 5000+ happy customers.",
  keywords: "custom furniture, furniture manufacturer, Thane, Maharashtra, wooden furniture, Mumbai, online furniture",
  openGraph: {
    title: "Ananya House of Furniture | Custom Furniture Thane",
    description: "Custom furniture designed to match your style. Best quality at affordable prices. 14+ years experience.",
    url: "https://ananyahouseoffurniture.in",
    siteName: "Ananya House of Furniture",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ananya House of Furniture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ananya House of Furniture",
    description: "Custom furniture designed to match your style. Best quality at affordable prices.",
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
  metadataBase: new URL("https://ananyahouseoffurniture.in"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="google-site-verification" content="aDEB0fLtHFpcrTyE1-6C6KP6wK4VHImgKtZpABLHUJA" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" //css
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FurnitureStore",
              name: "Ananya House of Furniture",
              description: "Custom furniture designed to match your style. Best quality at affordable prices.",
              url: "https://ananyahouseoffurniture.in",
              telephone: "+91-9321812823",
              email: "contact@ananyahouseoffurniture.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Diva-Shil Road, Khardipada",
                addressLocality: "Thane",
                addressRegion: "Maharashtra",
                postalCode: "400612",
                addressCountry: "IN",
              },
              priceRange: "₹₹",
              image: "https://ananyahouseoffurniture.in/og-image.jpg",
              openingHours: "Mo-Sa 09:00-19:00",
            }),
          }}
        />
      </head>
      <body>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
        <ChatBot />
        <ScrollRestoration />
        <Analytics />
        <GoogleAnalytics gaId={process.env.GA_MEASUREMENT_ID || ""} />
      </body>
    </html>
  );
}
