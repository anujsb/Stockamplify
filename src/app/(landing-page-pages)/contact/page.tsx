// app/contact/page.tsx
import Header from "@/components/header";
import React from "react";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact StockAmplify - Get Support & Feedback",
  description: "Contact StockAmplify team for support, questions, or feedback about our AI-powered stock analysis platform. We respond within 24 hours to help with your investment journey.",
  keywords: [
    "contact stockamplify",
    "customer support",
    "stock analysis help",
    "investment platform support",
    "AI stock analysis contact",
    "feedback",
    "technical support"
  ],
  openGraph: {
    title: "Contact StockAmplify - Get Support & Help",
    description: "Need help with our AI-powered stock analysis platform? Contact our support team for quick assistance with your investment journey.",
    type: "website"
  },
  alternates: {
    canonical: "/contact"
  }
};

export default function ContactPage() {
  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <Header />

    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-white">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-2xl p-6 sm:p-10 backdrop-blur-sm shadow-2xl border border-white/20">
          <h1 className="text-3xl sm:text-5xl font-bold mb-6 sm:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-center">
            Get in Touch
          </h1>

          <div className="space-y-8 sm:space-y-10">
            <p className="text-base sm:text-lg md:text-xl text-gray-300 text-center leading-relaxed px-1 sm:px-0">
              Have questions, suggestions, or need support? We're here to help you succeed with your investment journey.
            </p>

            <div className="flex flex-col items-stretch space-y-6 sm:space-y-8">
              {/* Email card */}
              <div className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-white/10 rounded-xl p-4 sm:p-6 w-full hover:bg-white/[0.15] transition-all duration-300 sm:hover:scale-105 border border-white/10 hover:border-blue-500/50 text-center sm:text-left">
                <div className="self-center sm:self-auto text-3xl sm:text-4xl bg-gradient-to-br from-blue-400 to-purple-400 rounded-full p-2 sm:p-3">
                  📧
                </div>
                <div className="w-full">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Email Us</h2>
                  <a href="mailto:stockamplifyfeedback@gmail.com"
                    className="break-all text-blue-400 hover:text-blue-300 transition duration-300 hover:underline">
                    stockamplifyfeedback@gmail.com
                  </a>
                </div>
              </div>

              {/* Response time card */}
              <div className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-white/10 rounded-xl p-4 sm:p-6 w-full hover:bg-white/[0.15] transition-all duration-300 sm:hover:scale-105 border border-white/10 hover:border-purple-500/50 text-center sm:text-left">
                <div className="self-center sm:self-auto text-3xl sm:text-4xl bg-gradient-to-br from-purple-400 to-pink-400 rounded-full p-2 sm:p-3">
                  ⏱️
                </div>
                <div className="w-full">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                    Response Time
                  </h2>
                  <p className="text-gray-300">We typically respond within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
  );
}
