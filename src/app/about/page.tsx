import React from "react";
import Header from "@/components/header";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About StockAmplify - Our Mission & Vision",
  description: "Learn about StockAmplify's mission to democratize smart investing with AI-powered stock analysis. Meet our expert team of financial analysts and technology specialists.",
  keywords: [
    "about stockamplify",
    "stock analysis company",
    "AI investment platform",
    "financial technology team",
    "investment research mission",
    "stock market experts",
    "fintech innovation",
    "democratize investing"
  ],
  openGraph: {
    title: "About StockAmplify - Democratizing Smart Investing",
    description: "Meet the team behind StockAmplify and learn about our mission to make AI-powered stock analysis accessible to every investor.",
    type: "website"
  },
  alternates: {
    canonical: "/about"
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <main className="relative px-6 py-20 min-h-screen flex items-center justify-center">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold mb-6 text-white">About Stock Amplify</h1>

          <p className="mb-6 text-lg leading-relaxed text-gray-400">
            <strong>Stock Amplify</strong> is a next-generation stock analysis platform built to simplify and enhance the investment journey of retail traders and investors. Our mission is to democratize access to deep market intelligence using AI-powered insights, rich data visualizations, and an intuitive interface.
          </p>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white/5 rounded-xl p-8 shadow-md border border-white/10">
              <h2 className="text-2xl font-semibold mb-4 text-white">Why We Built This</h2>
              <p className="text-lg leading-relaxed text-gray-400">
                Most platforms either overwhelm you with raw data or limit you to surface-level stats. We bridge that gap by offering in-depth financial analysis, momentum signals, institutional trends, and sentiment analysis — all in one unified, beautiful dashboard. Whether you're a beginner or an experienced trader, Stock Amplify gives you the edge.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-8 shadow-md border border-white/10">
              <h2 className="text-2xl font-semibold mb-4 text-white">Our Vision</h2>
              <p className="text-lg leading-relaxed text-gray-400">
                We believe that smart investing shouldn’t be a luxury. We envision a future where every Indian investor — from small-town beginners to seasoned professionals — can make smarter financial decisions with confidence and clarity. Stock Amplify is more than just a platform. It's a movement toward smarter, data-driven investing.
              </p>
            </div>
          </div>

          <div className="max-w-5xl mx-auto text-center mt-20 mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">Who We Are</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Stock Amplify is driven by a team of experts from both Financial Services and the Technology sector.
              Together, we bring deep domain knowledge, technical excellence, and a shared passion for democratizing smart investing.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-white">Vandana</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Worked as a financial research analyst with over 10 years of experience in equity research.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-white">Anuj</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Technology expert, an AI and machine learning specialist with a strong background in building scalable intelligent systems.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
