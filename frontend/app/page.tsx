"use client";

import Link from "next/link";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-[#f1f5f9]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-10 sm:h-10">
              <defs>
                <linearGradient id="navLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#14b8a6',stopOpacity:1}} />
                </linearGradient>
              </defs>
              <rect width="40" height="40" rx="8" fill="url(#navLogoGradient)"/>
              <path d="M8 20 L12 20 L14 12 L16 28 L18 16 L20 24 L22 20 L32 20" 
                    stroke="white" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    fill="none"/>
              <circle cx="14" cy="12" r="1.5" fill="white" opacity="0.8"/>
              <circle cx="16" cy="28" r="1.5" fill="white" opacity="0.8"/>
              <circle cx="18" cy="16" r="1.5" fill="white" opacity="0.8"/>
              <circle cx="20" cy="24" r="1.5" fill="white" opacity="0.8"/>
            </svg>
            <span className="text-lg sm:text-xl font-bold">NetPulse AI</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/history"
              className="hidden sm:block px-4 py-2 text-[#f1f5f9] hover:text-[#06b6d4] transition-colors font-medium"
            >
              History
            </Link>
            <Link
              href="/dashboard"
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#06b6d4] to-[#14b8a6] rounded-lg text-sm sm:text-base font-medium hover:opacity-90 transition-opacity"
            >
              Launch
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#06b6d4]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#14b8a6]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#06b6d4] via-[#14b8a6] to-[#0891b2] bg-clip-text text-transparent leading-tight">
            Intelligent 5G Network Optimization
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-[#64748b] mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Watch AI outperform traditional allocation in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
            <Link
              href="/dashboard"
              className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#06b6d4] to-[#14b8a6] rounded-xl font-semibold text-base sm:text-lg hover:shadow-2xl hover:shadow-[#06b6d4]/50 transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                <span>Launch Simulator</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
            <Link
              href="/how-it-works"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#06b6d4] rounded-xl font-semibold text-base sm:text-lg transition-all duration-300"
            >
              How It Works
            </Link>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#14b8a6] rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>API Docs</span>
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "100ms Tick Rate", icon: "⚡" },
              { label: "4 User Types", icon: "👥" },
              { label: "Real-time WebSocket", icon: "🔄" },
              { label: "Groq AI Powered", icon: "🧠" },
            ].map((stat, i) => (
              <div key={i} className="bg-[#0a0a0a]/60 backdrop-blur-sm border border-[#1a1a1a] rounded-xl p-4">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-sm text-[#64748b]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">Built With Modern Tech</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {[
              "Python", "FastAPI", "WebSocket", "Next.js", "React",
              "Tailwind CSS", "Recharts", "Groq API", "Llama 3", "Hypothesis"
            ].map((tech, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 sm:p-4 text-center hover:border-[#06b6d4] transition-colors">
                <span className="text-xs sm:text-sm font-medium">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
