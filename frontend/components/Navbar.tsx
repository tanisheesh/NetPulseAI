"use client";

import Link from "next/link";
import { useState } from "react";

interface NavbarProps {
  connectionStatus: "connected" | "disconnected";
  isRunning: boolean;
  tickCount: number;
}

export default function Navbar({ connectionStatus, isRunning, tickCount }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-[#1a1a1a]">
      <div className="max-w-[2560px] w-full mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-10 sm:h-10">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#14b8a6',stopOpacity:1}} />
                </linearGradient>
              </defs>
              <rect width="40" height="40" rx="8" fill="url(#logoGradient)"/>
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
            <div>
              <div className="text-base sm:text-lg font-bold text-[#f1f5f9]">NetPulse AI</div>
              <div className="text-[10px] sm:text-xs text-[#64748b] hidden sm:block">See the difference intelligence makes</div>
            </div>
          </div>

          {/* Desktop: Center & Right */}
          <div className="hidden md:flex items-center gap-6">
            {/* Center: Simulation Status */}
            <div className="flex items-center gap-2">
              {isRunning ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
                  <span className="text-sm font-medium text-[#10b981]">LIVE</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-[#64748b]"></div>
                  <span className="text-sm font-medium text-[#64748b]">IDLE</span>
                </>
              )}
            </div>

            {/* Right: Stats & Back Link */}
            <div className="flex items-center gap-6">
              {/* Tick Counter */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] rounded-lg">
                <span className="text-xs text-[#64748b]">Tick:</span>
                <span className="text-sm font-mono font-bold text-[#f1f5f9]">{tickCount}</span>
              </div>

              {/* WebSocket Status */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connected" ? "bg-[#10b981]" : "bg-[#ef4444]"
                  }`}
                />
                <span className="text-sm text-[#64748b]">
                  {connectionStatus === "connected" ? "Connected" : "Disconnected"}
                </span>
              </div>

              {/* Back to Home */}
              <Link
                href="/"
                className="text-sm text-[#64748b] hover:text-[#06b6d4] transition-colors flex items-center gap-1"
              >
                <span>←</span>
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
          
          {/* Mobile: Hamburger Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#f1f5f9] hover:bg-[#1a1a1a] rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-[#1a1a1a] space-y-4">
            {/* Simulation Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748b]">Status:</span>
              <div className="flex items-center gap-2">
                {isRunning ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
                    <span className="text-sm font-medium text-[#10b981]">LIVE</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-[#64748b]"></div>
                    <span className="text-sm font-medium text-[#64748b]">IDLE</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Tick Counter */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748b]">Tick:</span>
              <span className="text-sm font-mono font-bold text-[#f1f5f9]">{tickCount}</span>
            </div>
            
            {/* WebSocket Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748b]">Connection:</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connected" ? "bg-[#10b981]" : "bg-[#ef4444]"
                  }`}
                />
                <span className="text-sm text-[#64748b]">
                  {connectionStatus === "connected" ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
            
            {/* Back to Home */}
            <Link
              href="/"
              className="block text-sm text-[#06b6d4] hover:text-[#14b8a6] transition-colors text-center py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              ← Back to Home
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
