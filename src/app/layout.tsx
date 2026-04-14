import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import ChatBot from "@/components/ChatBot";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Ananya House of Furniture",
  description:
    "Custom furniture designed to match your style. Best quality at affordable prices.",
  openGraph: {
    title: "Ananya House of Furniture",
    description: "Custom furniture designed to match your style. Best quality at affordable prices.",
    url: "https://ananyahouseoffurniture.com",
    siteName: "Ananya House of Furniture",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ananya House of Furniture",
    description: "Custom furniture designed to match your style. Best quality at affordable prices.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" //css
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
        />
      </head>
      <body>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
        <ChatBot />
        <Analytics />
      </body>
    </html>
  );
}
