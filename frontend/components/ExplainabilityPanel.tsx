"use client";

interface ExplainabilityPanelProps {
  explanation: string | null | undefined;
  timestamp: number | null | undefined;
}

export default function ExplainabilityPanel({
  explanation,
  timestamp,
}: ExplainabilityPanelProps) {
  // Format timestamp to readable date/time
  const formatTimestamp = (ts: number | null | undefined): string => {
    if (!ts) return "N/A";
    const date = new Date(ts * 1000); // Convert from seconds to milliseconds
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-[#12121a] backdrop-blur-sm rounded-xl border-t-4 border-t-[#8b5cf6] border-x border-b border-[#1e1e2e] p-6 relative overflow-hidden">
      {/* Purple glow */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-[#8b5cf6]/10 blur-2xl"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#f1f5f9] flex items-center gap-2">
            <span>🧠</span>
            <span>AI Explainability</span>
          </h2>
          {timestamp && (
            <div className="text-sm text-[#64748b]">
              Last updated: {formatTimestamp(timestamp)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs rounded-full font-semibold border border-[#8b5cf6]/30">
            Groq
          </span>
          <span className="px-2 py-1 bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs rounded-full font-semibold border border-[#8b5cf6]/30">
            Llama 3
          </span>
        </div>

        <div className="bg-[#1e1e2e] border-l-4 border-[#8b5cf6] rounded-lg p-4">
          {explanation ? (
            <p className="text-[#f1f5f9] leading-relaxed" style={{ fontSize: "14px" }}>
              {explanation}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-[#64748b] italic" style={{ fontSize: "14px" }}>
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-100">●</span>
              <span className="animate-pulse delay-200">●</span>
              <span className="ml-2">Awaiting Groq analysis...</span>
            </div>
          )}
        </div>

        {explanation && (
          <div className="mt-4 text-xs text-[#64748b]">
            <p>
              The AI allocator uses weighted priority heuristics to optimize
              bandwidth allocation based on traffic characteristics and network
              conditions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
