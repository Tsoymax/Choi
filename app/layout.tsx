import type { Metadata, Viewport } from "next";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PWAController } from "@/components/pwa/PWAController";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Choi",
    template: "%s | Choi"
  },
  applicationName: "Choi",
  description: "Локальный маркетплейс Узбекистана. Всё начинается рядом.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Choi",
    statusBarStyle: "default"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#4f815c",
  colorScheme: "light"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        {children}
        <PWAController />
        <MobileBottomNav />
      </body>
    </html>
  );
}
