"use client";

interface AllocationData {
  video_streaming: number;
  online_gaming: number;
  iot_devices: number;
  voip_messaging: number;
}

interface ComparisonPanelsProps {
  baselineAllocations: AllocationData;
  aiAllocations: AllocationData;
  rlAllocations?: AllocationData;
  baselineQoS: number;
  aiQoS: number;
  rlQoS?: number;
  tick: number;
  explorationRate?: number;
}

export default function ComparisonPanels({
  baselineAllocations,
  aiAllocations,
  rlAllocations,
  baselineQoS,
  aiQoS,
  rlQoS,
  tick,
  explorationRate,
}: ComparisonPanelsProps) {
  const hasRL = rlAllocations && rlQoS !== undefined;
  
  return (
    <div className={`grid grid-cols-1 ${hasRL ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6 relative`}>
      {/* VS Badge (only show for 2-panel layout) */}
      {!hasRL && (
        <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center border-4 border-[#0a0a0f] shadow-lg">
            <span className="text-white font-bold text-lg">VS</span>
          </div>
        </div>
      )}

      {/* Baseline Panel */}
      <div className="bg-[#12121a] backdrop-blur-sm rounded-xl border-t-4 border-t-blue-500 border-x border-b border-[#1e1e2e] p-6 relative overflow-hidden">
        {/* Blue glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-blue-500/10 blur-2xl"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-400">
              Baseline Equal-Split
            </h2>
            <div className="text-right">
              <div className="text-xs text-[#64748b] mb-1">QoS Score</div>
              <div className="text-3xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                {baselineQoS.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <AllocationBar
              label="Video Streaming"
              value={baselineAllocations.video_streaming}
              color="from-blue-500 to-blue-600"
              icon="🎥"
            />
            <AllocationBar
              label="Online Gaming"
              value={baselineAllocations.online_gaming}
              color="from-blue-500 to-blue-600"
              icon="🎮"
            />
            <AllocationBar
              label="IoT Devices"
              value={baselineAllocations.iot_devices}
              color="from-blue-500 to-blue-600"
              icon="📡"
            />
            <AllocationBar
              label="VoIP/Messaging"
              value={baselineAllocations.voip_messaging}
              color="from-blue-500 to-blue-600"
              icon="💬"
            />
          </div>
        </div>
      </div>

      {/* AI Panel */}
      <div className="bg-[#12121a] backdrop-blur-sm rounded-xl border-t-4 border-t-purple-500 border-x border-b border-[#1e1e2e] p-6 relative overflow-hidden">
        {/* Purple glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-purple-500/10 blur-2xl"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-purple-400">
                AI Weighted Priority
              </h2>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full font-semibold">
                AI
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#64748b] mb-1">QoS Score</div>
              <div className="text-3xl font-bold text-purple-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                {aiQoS.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <AllocationBar
              label="Video Streaming"
              value={aiAllocations.video_streaming}
              color="from-purple-500 to-purple-600"
              icon="🎥"
            />
            <AllocationBar
              label="Online Gaming"
              value={aiAllocations.online_gaming}
              color="from-purple-500 to-purple-600"
              icon="🎮"
            />
            <AllocationBar
              label="IoT Devices"
              value={aiAllocations.iot_devices}
              color="from-purple-500 to-purple-600"
              icon="📡"
            />
            <AllocationBar
              label="VoIP/Messaging"
              value={aiAllocations.voip_messaging}
              color="from-purple-500 to-purple-600"
              icon="💬"
            />
          </div>
        </div>
      </div>

      {/* RL Panel */}
      {hasRL && (
        <div className="bg-[#12121a] backdrop-blur-sm rounded-xl border-t-4 border-t-green-500 border-x border-b border-[#1e1e2e] p-6 relative overflow-hidden">
          {/* Green glow */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-green-500/10 blur-2xl"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-green-400">
                  RL Multi-Armed Bandit
                </h2>
                {tick < 100 && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold animate-pulse">
                    Learning...
                  </span>
                )}
                {tick >= 500 && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">
                    Converged
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-[#64748b] mb-1">QoS Score</div>
                <div className="text-3xl font-bold text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                  {rlQoS!.toFixed(2)}
                </div>
              </div>
            </div>
            {explorationRate !== undefined && (
              <div className="mb-4 text-sm text-green-400">
                Exploring: {(explorationRate * 100).toFixed(1)}%
              </div>
            )}
            <div className="space-y-4">
              <AllocationBar
                label="Video Streaming"
                value={rlAllocations!.video_streaming}
                color="from-green-500 to-green-600"
                icon="🎥"
              />
              <AllocationBar
                label="Online Gaming"
                value={rlAllocations!.online_gaming}
                color="from-green-500 to-green-600"
                icon="🎮"
              />
              <AllocationBar
                label="IoT Devices"
                value={rlAllocations!.iot_devices}
                color="from-green-500 to-green-600"
                icon="📡"
              />
              <AllocationBar
                label="VoIP/Messaging"
                value={rlAllocations!.voip_messaging}
                color="from-green-500 to-green-600"
                icon="💬"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AllocationBar({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-[#f1f5f9] flex items-center gap-2">
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        <span className="font-mono font-bold text-[#f1f5f9]">{value.toFixed(2)} Mbps</span>
      </div>
      <div className="w-full bg-[#1e1e2e] rounded-full h-3 overflow-hidden">
        <div
          className={`bg-gradient-to-r ${color} h-3 rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
