import type { Metadata } from "next";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Choi - Local Marketplace",
  description: "A modern marketplace for curated neighborhood finds."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
