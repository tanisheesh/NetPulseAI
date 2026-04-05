"use client";

interface QoSImprovementBannerProps {
  baselineQoS: number;
  aiQoS: number;
  rlQoS?: number;
}

export default function QoSImprovementBanner({
  baselineQoS,
  aiQoS,
  rlQoS,
}: QoSImprovementBannerProps) {
  const aiImprovement = ((aiQoS - baselineQoS) / baselineQoS) * 100;
  const rlImprovement = rlQoS !== undefined ? ((rlQoS - baselineQoS) / baselineQoS) * 100 : null;
  
  const bestQoS = rlQoS !== undefined ? Math.max(baselineQoS, aiQoS, rlQoS) : Math.max(baselineQoS, aiQoS);
  const isAIBest = aiQoS === bestQoS;
  const isRLBest = rlQoS === bestQoS;

  return (
    <div
      className={`relative rounded-xl p-8 text-center overflow-hidden ${
        isRLBest
          ? "bg-gradient-to-r from-[#22c55e]/10 to-[#10b981]/10 border border-[#22c55e]/30"
          : isAIBest
          ? "bg-gradient-to-r from-[#6366f1]/10 to-[#8b5cf6]/10 border border-[#6366f1]/30"
          : "bg-[#12121a] border border-[#1e1e2e]"
      }`}
    >
      {/* Glow effect */}
      {isRLBest && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e]/20 to-[#10b981]/20 blur-xl"></div>
      )}
      {isAIBest && !isRLBest && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/20 to-[#8b5cf6]/20 blur-xl"></div>
      )}

      <div className="relative">
        <h2 className="text-xl font-semibold text-[#64748b] mb-6">
          QoS Performance Comparison
        </h2>
        
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {/* Baseline */}
          <div className="flex flex-col items-center">
            <div className="text-sm text-[#64748b] mb-2">Baseline</div>
            <div className="text-4xl font-bold text-blue-400">
              {baselineQoS.toFixed(1)}
            </div>
          </div>
          
          <div className="text-3xl text-[#64748b]">|</div>
          
          {/* AI */}
          <div className="flex flex-col items-center">
            <div className="text-sm text-[#64748b] mb-2">AI</div>
            <div className="text-4xl font-bold text-purple-400">
              {aiQoS.toFixed(1)}
            </div>
            <div className={`text-sm mt-1 ${aiImprovement > 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {aiImprovement > 0 ? '+' : ''}{aiImprovement.toFixed(1)}%
            </div>
          </div>
          
          {rlQoS !== undefined && (
            <>
              <div className="text-3xl text-[#64748b]">|</div>
              
              {/* RL */}
              <div className="flex flex-col items-center">
                <div className="text-sm text-[#64748b] mb-2">RL</div>
                <div className="text-4xl font-bold text-green-400">
                  {rlQoS.toFixed(1)}
                </div>
                <div className={`text-sm mt-1 ${rlImprovement! > 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {rlImprovement! > 0 ? '+' : ''}{rlImprovement!.toFixed(1)}%
                </div>
              </div>
            </>
          )}
        </div>
        
        <p className="text-sm text-[#64748b] mt-6">
          {rlQoS !== undefined ? 'Three-way' : 'Two-way'} Performance Comparison
        </p>
      </div>
    </div>
  );
}
