"use client";

import { useMemo } from "react";
import ThroughputChart from "./ThroughputChart";
import AllocationChart from "./AllocationChart";
import QoSBreakdownChart from "./QoSBreakdownChart";
import { NetworkState } from "@/hooks/useWebSocket";

interface ChartsSectionProps {
  history: NetworkState[];
}

export default function ChartsSection({ history }: ChartsSectionProps) {
  // Transform history data for allocation chart (THIS WILL SHOW DIFFERENCES!)
  const allocationData = useMemo(() => {
    return history.map((state) => ({
      tick: state.tick,
      baseline_video: state.baseline_result.decision.allocations.video_streaming,
      baseline_gaming: state.baseline_result.decision.allocations.online_gaming,
      baseline_iot: state.baseline_result.decision.allocations.iot_devices,
      baseline_voip: state.baseline_result.decision.allocations.voip_messaging,
      ai_video: state.ai_result.decision.allocations.video_streaming,
      ai_gaming: state.ai_result.decision.allocations.online_gaming,
      ai_iot: state.ai_result.decision.allocations.iot_devices,
      ai_voip: state.ai_result.decision.allocations.voip_messaging,
      rl_video: state.rl_result?.decision.allocations.video_streaming,
      rl_gaming: state.rl_result?.decision.allocations.online_gaming,
      rl_iot: state.rl_result?.decision.allocations.iot_devices,
      rl_voip: state.rl_result?.decision.allocations.voip_messaging,
    }));
  }, [history]);

  // Transform history data for throughput chart
  const throughputData = useMemo(() => {
    return history.map((state) => ({
      tick: state.tick,
      baseline_video: state.baseline_result.metrics.video_streaming.throughput,
      baseline_gaming: state.baseline_result.metrics.online_gaming.throughput,
      baseline_iot: state.baseline_result.metrics.iot_devices.throughput,
      baseline_voip: state.baseline_result.metrics.voip_messaging.throughput,
      ai_video: state.ai_result.metrics.video_streaming.throughput,
      ai_gaming: state.ai_result.metrics.online_gaming.throughput,
      ai_iot: state.ai_result.metrics.iot_devices.throughput,
      ai_voip: state.ai_result.metrics.voip_messaging.throughput,
      rl_video: state.rl_result?.metrics.video_streaming.throughput,
      rl_gaming: state.rl_result?.metrics.online_gaming.throughput,
      rl_iot: state.rl_result?.metrics.iot_devices.throughput,
      rl_voip: state.rl_result?.metrics.voip_messaging.throughput,
    }));
  }, [history]);

  // Calculate QoS breakdown for current state (last item in history)
  const qosBreakdownData = useMemo(() => {
    if (history.length === 0) {
      return [
        { userType: "Video", baseline: 0, ai: 0, rl: undefined },
        { userType: "Gaming", baseline: 0, ai: 0, rl: undefined },
        { userType: "IoT", baseline: 0, ai: 0, rl: undefined },
        { userType: "VoIP", baseline: 0, ai: 0, rl: undefined },
      ];
    }

    const latest = history[history.length - 1];
    
    // Calculate per-user-type QoS scores using the same formula as backend
    // This includes allocation_efficiency which is key to showing AI benefits
    const calculateUserQoS = (metrics: {
      latency: number;
      throughput: number;
      packet_loss: number;
      allocation_efficiency: number;
    }) => {
      // Normalize throughput (0-100 scale)
      const normalizedThroughput = Math.min((metrics.throughput / 100) * 100, 100);
      
      // Latency score (lower is better, inverted to 0-100 scale)
      const latencyScore = Math.max(0, 100 - Math.min(metrics.latency, 100));
      
      // Packet retention (100 - packet_loss)
      const packetRetention = Math.max(0, 100 - metrics.packet_loss);
      
      // Use the same weighted formula as backend (25-25-15-35)
      return (
        normalizedThroughput * 0.25 +
        latencyScore * 0.25 +
        packetRetention * 0.15 +
        metrics.allocation_efficiency * 0.35
      );
    };

    return [
      {
        userType: "Video",
        baseline: calculateUserQoS(latest.baseline_result.metrics.video_streaming),
        ai: calculateUserQoS(latest.ai_result.metrics.video_streaming),
        rl: latest.rl_result ? calculateUserQoS(latest.rl_result.metrics.video_streaming) : undefined,
      },
      {
        userType: "Gaming",
        baseline: calculateUserQoS(latest.baseline_result.metrics.online_gaming),
        ai: calculateUserQoS(latest.ai_result.metrics.online_gaming),
        rl: latest.rl_result ? calculateUserQoS(latest.rl_result.metrics.online_gaming) : undefined,
      },
      {
        userType: "IoT",
        baseline: calculateUserQoS(latest.baseline_result.metrics.iot_devices),
        ai: calculateUserQoS(latest.ai_result.metrics.iot_devices),
        rl: latest.rl_result ? calculateUserQoS(latest.rl_result.metrics.iot_devices) : undefined,
      },
      {
        userType: "VoIP",
        baseline: calculateUserQoS(latest.baseline_result.metrics.voip_messaging),
        ai: calculateUserQoS(latest.ai_result.metrics.voip_messaging),
        rl: latest.rl_result ? calculateUserQoS(latest.rl_result.metrics.voip_messaging) : undefined,
      },
    ];
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] p-6">
        <p className="text-[#64748b] text-center">
          No data available. Start the simulation to see real-time charts.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <AllocationChart data={allocationData} />
      <ThroughputChart data={throughputData} />
      <div className="lg:col-span-2">
        <QoSBreakdownChart data={qosBreakdownData} />
      </div>
    </div>
  );
}
