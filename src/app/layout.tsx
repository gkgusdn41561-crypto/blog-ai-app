import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "블로그 AI 원고 작성기",
  description: "내 문체를 학습해서 블로그 원고를 대신 써주는 AI 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
