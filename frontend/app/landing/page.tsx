"use client";

import Link from "next/link";
import Footer from "@/components/Footer";

export default function LandingPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f1f5f9]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#12121a]/80 backdrop-blur-lg border-b border-[#1e1e2e]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="navLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#6366f1',stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#8b5cf6',stopOpacity:1}} />
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
            <span className="text-xl font-bold">NetPulse AI</span>
          </div>
          <Link
            href="/dashboard"
            className="px-6 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Launch Simulator
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366f1]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8b5cf6]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
            Intelligent 5G Network Optimization
          </h1>
          <p className="text-xl md:text-2xl text-[#64748b] mb-8 max-w-3xl mx-auto">
            Watch AI outperform traditional allocation in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#6366f1]/50"
            >
              Launch Simulator
            </Link>
            <Link
              href="/how-it-works"
              className="px-8 py-4 border-2 border-[#1e1e2e] rounded-xl font-semibold text-lg hover:border-[#6366f1] transition-colors"
            >
              How It Works
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-2 border-[#1e1e2e] rounded-xl font-semibold text-lg hover:border-[#8b5cf6] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              API Docs
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
              <div key={i} className="bg-[#12121a]/60 backdrop-blur-sm border border-[#1e1e2e] rounded-xl p-4">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-sm text-[#64748b]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Built With Modern Tech</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              "Python", "FastAPI", "WebSocket", "Next.js", "React",
              "Tailwind CSS", "Recharts", "Groq API", "Llama 3", "Hypothesis"
            ].map((tech, i) => (
              <div key={i} className="bg-[#12121a] border border-[#1e1e2e] rounded-lg p-4 text-center hover:border-[#6366f1] transition-colors">
                <span className="text-sm font-medium">{tech}</span>
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
