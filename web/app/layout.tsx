import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ong-trum-tu-ban-game.codex-dmh-03-2901.chatgpt.site"),
  title: "Marxopoly — Ông Trùm Tư Bản",
  description: "Mua tài sản, mở rộng kinh doanh và dẫn đầu bàn cờ trong game chiến lược dành cho 2–4 người.",

  openGraph: {
    title: "Ông Trùm Tư Bản",
    description: "Mua • Xây • Kinh doanh • Dẫn đầu",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Bàn game Ông Trùm Tư Bản" }],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ông Trùm Tư Bản",
    description: "Mua • Xây • Kinh doanh • Dẫn đầu",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
