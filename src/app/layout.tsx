import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import ChatBot from "@/components/ChatBot";
import ScrollRestoration from "@/components/ScrollRestoration";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Ananya House of Furniture | Custom Furniture Mumbai, Navi Mumbai & Thane",
  description:
    "Custom furniture, modular kitchens & wardrobes in Mumbai, Navi Mumbai & Thane. Factory-direct prices, free site visit, 3D design & 5-year warranty. 14+ years experience.",
  keywords:
    "custom furniture Mumbai, modular kitchen Mumbai, wardrobe Navi Mumbai, furniture shop Thane, custom furniture manufacturer Maharashtra, home interiors Mumbai",
  openGraph: {
    title: "Ananya House of Furniture | Custom Furniture Mumbai, Navi Mumbai & Thane",
    description:
      "Custom furniture & modular kitchens for Mumbai, Navi Mumbai & Thane. Free site visit, 3D design, factory-direct pricing.",
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
              areaServed: [
                { "@type": "City", name: "Mumbai" },
                { "@type": "City", name: "Navi Mumbai" },
                { "@type": "City", name: "Thane" },
                { "@type": "City", name: "Ahmedabad" },
              ],
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
