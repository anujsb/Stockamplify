import Header from "@/components/header";
import WatchDemoModal from "@/components/WatchDemoModal";
import { ArrowRight, BarChart3, Brain, Eye, FileText, Upload, Zap } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "AI-Powered Stock Analysis & Portfolio Management Platform",
  description:
    "Discover StockAmplify - the ultimate AI-powered stock research platform. Get real-time portfolio tracking, smart market insights, news analysis, and investment recommendations all in one place.",
  keywords: [
    "stock analysis platform",
    "AI stock research",
    "portfolio dashboard",
    "real-time stock data",
    "investment insights",
    "stock market news",
    "financial analytics",
    "trading tools",
    "market predictions",
    "investment management",
  ],
  openGraph: {
    title: "StockAmplify - AI-Powered Stock Analysis Platform",
    description:
      "Transform your investment strategy with AI-powered insights, real-time data, and comprehensive market analysis.",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "StockAmplify Platform Dashboard",
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "StockAmplify",
    description:
      "AI-powered stock analysis and portfolio management platform with real-time market insights, news analysis, and investment recommendations.",
    url: "https://stockamplify.com",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      name: "Free Trial",
      description: "14-day free trial with full access to all features",
    },
    creator: {
      "@type": "Organization",
      name: "StockAmplify",
      url: "https://stockamplify.com",
    },
    featureList: [
      "AI-powered stock analysis",
      "Real-time portfolio tracking",
      "Market news and insights",
      "Investment recommendations",
      "Portfolio dashboard",
      "Stock watchlist",
      "Performance analytics",
    ],
    screenshot: "https://stockamplify.com/logo.png",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { send_page_view: true });
            `}
          </Script>
        </>
      )}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Header */}
        <Header />

        {/* Hero Section */}
        <section className="relative px-6 py-20">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-white">
              <Zap className="mr-2 h-4 w-4" />
              AI-Powered Stock Analysis
            </div>
            <h1 className="mb-6 text-5xl md:text-7xl font-bold text-white leading-tight">
              Stock Research
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Simplified. Amplified.
              </span>
            </h1>
            <p className="mb-10 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              StockAmplify isn't just another stock research tool. It's your AI-powered amplifier,
              boosting clarity, confidence, and conviction in every investment you make.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/sign-in"
                className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-medium text-white hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <WatchDemoModal />
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 mx-auto max-w-5xl">
            <div className="rounded-2xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                  <BarChart3 className="h-8 w-8 text-blue-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">Portfolio Dashboard</h3>
                  <p className="text-gray-300 text-sm">Complete overview of your investments</p>
                </div>
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                  <Brain className="h-8 w-8 text-purple-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">AI Predictions</h3>
                  <p className="text-gray-300 text-sm">
                    Smart recommendations based on real-time data
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                  <FileText className="h-8 w-8 text-green-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">Live News Feed</h3>
                  <p className="text-gray-300 text-sm">Relevant news for your portfolio</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-20 bg-gradient-to-b from-transparent to-black/20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Everything You Need for
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 leading-tight pb-1">
                  Smart Investing
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our comprehensive suite of tools helps you make informed investment decisions with
                confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Dashboard */}
              <div className="group relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <BarChart3 className="h-12 w-12 text-blue-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Portfolio Dashboard</h3>
                <p className="text-gray-300 mb-6">
                  Get a comprehensive view of all your investments with detailed analytics,
                  performance metrics, and visual representations of your portfolio distribution.
                </p>
                <div className="flex items-center text-blue-400">
                  <span className="text-sm font-medium">View Dashboard</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Portfolio Management */}
              <div className="group relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Upload className="h-12 w-12 text-purple-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Portfolio Management</h3>
                <p className="text-gray-300 mb-6">
                  Upload CSV files or manually add stocks to your portfolio. Easily manage your
                  holdings and track performance across multiple investment accounts.
                </p>
                <div className="flex items-center text-purple-400">
                  <span className="text-sm font-medium">Manage Portfolio</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* News Feed */}
              <div className="group relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <FileText className="h-12 w-12 text-green-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Smart News Feed</h3>
                <p className="text-gray-300 mb-6">
                  Stay informed with personalized news related to your stocks, plus trending market
                  news and analysis that could impact your investments.
                </p>
                <div className="flex items-center text-green-400">
                  <span className="text-sm font-medium">Read News</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* AI Predictions */}
              <div className="group relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-yellow-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Brain className="h-12 w-12 text-yellow-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Insights</h3>
                <p className="text-gray-300 mb-6">
                  Advanced machine learning analyzes real-time prices and news to provide actionable
                  recommendations and predict stock movements.
                </p>
                <div className="flex items-center text-yellow-400">
                  <span className="text-sm font-medium">Get Insights</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Watchlist */}
              <div className="group relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-red-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Eye className="h-12 w-12 text-red-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Smart Watchlist</h3>


                <p className="text-gray-300 mb-6">
                  Monitor potential investments and track stocks you're interested in but don't own
                  yet. Get alerts when opportunities arise.
                </p>
                <div className="flex items-center text-red-400">
                  <span className="text-sm font-medium">Build Watchlist</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Real-time Data */}
              <div className="group relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-indigo-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Zap className="h-12 w-12 text-indigo-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Real-time Data</h3>
                <p className="text-gray-300 mb-6">
                  Access real-time stock prices, market data, and financial metrics for the most
                  up-to-date information.
                </p>
                <div className="flex items-center text-indigo-400">
                  <span className="text-sm font-medium">View Data</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">How It Works</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Get started in minutes with our simple three-step process
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-2xl font-bold text-white">
                  1
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Upload Portfolio</h3>
                <p className="text-gray-300">
                  Upload your existing portfolio via CSV or add stocks manually to get started with
                  comprehensive tracking.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-2xl font-bold text-white">
                  2
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">AI Analysis</h3>
                <p className="text-gray-300">
                  Our AI analyzes your portfolio, real-time market data, and relevant news to
                  provide intelligent insights.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600 text-2xl font-bold text-white">
                  3
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Make Decisions</h3>
                <p className="text-gray-300">
                  Receive actionable insights and make informed investment decisions based on
                  comprehensive analysis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="px-6 py-20 bg-gradient-to-b from-transparent to-black/20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">
                Built for the Next Generation of Investors
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                  AI-Powered
                </div>
                <p className="text-gray-300">Insights that amplify your decisions</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                  Built for You
                </div>
                <p className="text-gray-300">Designed with real investors in mind</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-2">
                  Growing Community
                </div>
                <p className="text-gray-300">Join a vibrant community of investors</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 leading-tight pb-1">
                Investment Strategy?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Join a growing community of investors transforming their strategies with
              StockAmplify’s AI-powered insights — right at their fingertips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/sign-in"
                className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-medium text-white hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="text-sm text-gray-400">No credit card required</div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 px-6 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Image
                  src="/logo.png"
                  alt="StockAmplify - AI-Powered Stock Analysis Platform Logo"
                  width={40}
                  height={40}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-1"
                />
                <span className="text-xl font-bold text-white">StockAmplify</span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <Link href="/disclaimer" className="hover:text-white transition-colors">
                  Disclaimer
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>
            <footer className="text-center text-sm text-gray-400 mt-12">
              © 2025 StockAmplify. All rights reserved. Designed by
              <a
                href="https://www.21bubbles.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline hover:text-blue-400 ml-1"
              >
                21bubbles
              </a>
              .
            </footer>
          </div>
        </footer>
      </div>
    </>
  );
}
