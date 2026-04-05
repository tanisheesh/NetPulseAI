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
    <div className="bg-[#12121a] backdrop-blur-sm rounded-xl border border-[#1e1e2e] p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-3">
          <button
            onClick={onStart}
            disabled={isRunning}
            className="px-8 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#10b981]/20 disabled:shadow-none flex items-center gap-2"
          >
            <span>▶</span>
            <span>START</span>
          </button>
          <button
            onClick={onStop}
            disabled={!isRunning}
            className="px-8 py-3 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#ef4444]/20 disabled:shadow-none flex items-center gap-2"
          >
            <span>■</span>
            <span>STOP</span>
          </button>
          <button
            onClick={onReset}
            className="px-8 py-3 bg-[#1e1e2e] border-2 border-[#64748b] text-[#f1f5f9] rounded-xl font-semibold hover:border-[#6366f1] transition-colors flex items-center gap-2"
          >
            <span>↻</span>
            <span>RESET</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1e1e2e] rounded-lg">
          <span className="text-sm text-[#64748b]">Speed:</span>
          <span className="text-sm font-semibold text-[#06b6d4]">10 ticks/sec</span>
        </div>
      </div>
    </div>
  );
}
