import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import ClientLayout from "./ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StockAmplify - AI-Powered Stock Analysis & Portfolio Management",
    template: "%s | StockAmplify"
  },
  description: "Transform your investment strategy with StockAmplify's AI-powered stock analysis, real-time portfolio tracking, and smart market insights. Get comprehensive stock research, news, and predictions in one platform.",
  keywords: [
    "stock analysis",
    "AI stock predictions",
    "portfolio management",
    "stock market research",
    "investment tracking",
    "financial analytics",
    "stock news",
    "market insights",
    "trading platform",
    "investment dashboard"
  ],
  authors: [{ name: "StockAmplify Team" }],
  creator: "StockAmplify",
  publisher: "StockAmplify",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://stockamplify.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "StockAmplify - AI-Powered Stock Analysis & Portfolio Management",
    description: "Transform your investment strategy with AI-powered stock analysis, real-time portfolio tracking, and smart market insights.",
    url: 'https://stockamplify.com',
    siteName: 'StockAmplify',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'StockAmplify - AI-Powered Stock Analysis Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "StockAmplify - AI-Powered Stock Analysis",
    description: "Transform your investment strategy with AI-powered insights and real-time market data.",
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ClientLayout>
            {children}
          </ClientLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}