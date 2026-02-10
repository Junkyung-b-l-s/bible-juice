import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReflectionProvider } from "@/context/ReflectionContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bible Juice | 당신을 위한 맞춤 말씀 처방",
  description: "두려움, 불안, 우울... 당신의 상황에 딱 맞는 하나님의 말씀을 찾아드립니다. 성경으로 마음의 평안을 얻으세요.",
  metadataBase: new URL('https://bible-juice.com'),
  openGraph: {
    title: "Bible Juice | 당신을 위한 맞춤 말씀 처방",
    description: "당신의 상황에 딱 맞는 하나님의 말씀을 찾아드립니다.",
    url: 'https://bible-juice.com',
    siteName: 'Bible Juice',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bible Juice",
    description: "당신의 상황에 딱 맞는 하나님의 말씀을 찾아드립니다.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReflectionProvider>
          {children}
        </ReflectionProvider>
      </body>
    </html>
  );
}
