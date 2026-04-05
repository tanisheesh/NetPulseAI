"use client";

interface ControlPanelProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export default function ControlPanel({
  isRunning,
  onStart,
  onStop,
  onReset,
}: ControlPanelProps) {
  return (
    <div className="bg-[#0a0a0a] backdrop-blur-sm rounded-xl border border-[#1a1a1a] p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        {/* Buttons Row */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
          <button
            onClick={onStart}
            disabled={isRunning}
            className="flex-1 px-4 sm:px-8 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#10b981]/20 disabled:shadow-none flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>▶</span>
            <span>START</span>
          </button>
          <button
            onClick={onStop}
            disabled={!isRunning}
            className="flex-1 px-4 sm:px-8 py-3 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#ef4444]/20 disabled:shadow-none flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>■</span>
            <span>STOP</span>
          </button>
          <button
            onClick={onReset}
            className="flex-1 px-4 sm:px-8 py-3 bg-[#1a1a1a] border-2 border-[#64748b] text-[#f1f5f9] rounded-xl font-semibold hover:border-[#06b6d4] transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>↻</span>
            <span>RESET</span>
          </button>
        </div>
        
        {/* Speed Indicator */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1a1a1a] rounded-lg w-full sm:w-auto sm:self-center">
          <span className="text-sm text-[#64748b]">Speed:</span>
          <span className="text-sm font-semibold text-[#06b6d4]">10 ticks/sec</span>
        </div>
      </div>
    </div>
  );
}
