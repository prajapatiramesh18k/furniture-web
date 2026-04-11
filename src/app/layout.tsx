import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "Ananya House of Furniture",
  description:
    "Custom furniture designed to match your style. Best quality at affordable prices.",
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
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
        />
      </head>
      <body>
        <CartProvider>{children}</CartProvider>
        <ChatBot />
      </body>
    </html>
  );
}
