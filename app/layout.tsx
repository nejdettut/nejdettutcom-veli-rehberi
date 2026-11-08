import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Veli Rehberi — nejdettut.com",
  description:
    "Çocuğunun yaş grubunu seç, sorunu yaz — yapay zekâ pedagog yaklaşımıyla aksiyonlı tavsiye + aktivite önerisi + ekran süresi ipucu verir.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
