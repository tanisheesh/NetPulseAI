"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [healthStatus, setHealthStatus] = useState<"healthy" | "degraded" | "unknown">("unknown");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/health`);
        if (response.ok) {
          const data = await response.json();
          setHealthStatus(data.status);
        } else {
          setHealthStatus("degraded");
        }
      } catch (error) {
        setHealthStatus("degraded");
      }
    };

    // Check immediately
    checkHealth();

    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (healthStatus) {
      case "healthy":
        return "bg-green-500";
      case "degraded":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (healthStatus) {
      case "healthy":
        return "All Systems Operational";
      case "degraded":
        return "System Degraded";
      default:
        return "Checking Status...";
    }
  };

  return (
    <footer className="border-t border-[#1a1a1a] py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4">
          <div className="text-sm text-[#64748b]">
            © {new Date().getFullYear()} | Made with <span className="text-red-500">❤</span> by{" "}
            <a 
              href="https://tanisheesh.is-a.dev/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#06b6d4] hover:text-[#14b8a6] transition-colors"
            >
              Tanish Poddar
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
            <a 
              href="https://github.com/tanisheesh/NetPulseAI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#64748b] hover:text-[#06b6d4] transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
            <span className="text-[#64748b]">|</span>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/health`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#64748b] hover:text-[#06b6d4] transition-colors"
            >
              <span className="relative flex h-2 w-2">
                {healthStatus === "healthy" && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${getStatusColor()}`}></span>
              </span>
              <span>{getStatusText()}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
