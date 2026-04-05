"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import ControlPanel from "@/components/ControlPanel";
import QoSImprovementBanner from "@/components/QoSImprovementBanner";
import ComparisonPanels from "@/components/ComparisonPanels";
import ChartsSection from "@/components/ChartsSection";
import StatisticsTable from "@/components/StatisticsTable";
import ExplainabilityPanel from "@/components/ExplainabilityPanel";
import ConfigurationPanel from "@/components/ConfigurationPanel";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Footer from "@/components/Footer";
import { useWebSocket, NetworkState } from "@/hooks/useWebSocket";
import * as api from "@/lib/api";

export default function Dashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<NetworkState[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [config, setConfig] = useState<api.SimulationConfig>({
    total_bandwidth: 100.0,
    base_latency: 10.0,
    congestion_factor: 1.5,
    packet_loss_rate: 2.0,
    random_seed: 42,
  });
  const historyRef = useRef<NetworkState[]>([]);
  
  // WebSocket connection
  const { networkState, connectionStatus, error } = useWebSocket();

  // Maintain rolling window of 100 most recent ticks
  useEffect(() => {
    if (networkState) {
      const newHistory = [...historyRef.current, networkState];
      
      // Keep only last 100 ticks
      if (newHistory.length > 100) {
        newHistory.shift();
      }
      
      historyRef.current = newHistory;
      setHistory(newHistory);
    }
  }, [networkState]);

  // Use real data from WebSocket or fallback to mock data
  const baselineAllocations = networkState?.baseline_result.decision.allocations || {
    video_streaming: 25.0,
    online_gaming: 25.0,
    iot_devices: 25.0,
    voip_messaging: 25.0,
  };

  const aiAllocations = networkState?.ai_result.decision.allocations || {
    video_streaming: 30.0,
    online_gaming: 35.0,
    iot_devices: 15.0,
    voip_messaging: 20.0,
  };
  
  const rlAllocations = networkState?.rl_result?.decision.allocations;

  const baselineQoS = networkState?.baseline_result.qos_score || 0;
  const aiQoS = networkState?.ai_result.qos_score || 0;
  const rlQoS = networkState?.rl_result?.qos_score;
  
  // Debug logging to console
  useEffect(() => {
    if (networkState) {
      console.log(`\n=== Tick ${networkState.tick} ===`);
      console.log(`Baseline QoS: ${baselineQoS.toFixed(2)}`);
      console.log(`AI QoS: ${aiQoS.toFixed(2)}`);
      if (rlQoS !== undefined) {
        console.log(`RL QoS: ${rlQoS.toFixed(2)}`);
      }
      console.log(`Difference: ${(aiQoS - baselineQoS > 0 ? '+' : '')}${(aiQoS - baselineQoS).toFixed(2)} ${aiQoS > baselineQoS ? '✅' : '❌'}`);
      
      console.log('\nAllocations:');
      console.log('Baseline:', JSON.stringify(baselineAllocations, null, 2));
      console.log('AI:', JSON.stringify(aiAllocations, null, 2));
      if (rlAllocations) {
        console.log('RL:', JSON.stringify(rlAllocations, null, 2));
      }
      
      console.log('\nSample Metrics (video_streaming):');
      console.log('Baseline:', JSON.stringify(networkState.baseline_result.metrics.video_streaming, null, 2));
      console.log('AI:', JSON.stringify(networkState.ai_result.metrics.video_streaming, null, 2));
      if (networkState.rl_result) {
        console.log('RL:', JSON.stringify(networkState.rl_result.metrics.video_streaming, null, 2));
      }
    }
  }, [networkState, baselineQoS, aiQoS, rlQoS, baselineAllocations, aiAllocations, rlAllocations]);
  
  const currentTick = networkState?.tick || 0;
  
  // Fetch RL stats for exploration rate
  const [rlStats, setRlStats] = useState<any>(null);
  
  useEffect(() => {
    if (isRunning && currentTick > 0) {
      const fetchRLStats = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/simulation/rl-stats');
          if (response.ok) {
            const data = await response.json();
            setRlStats(data);
          }
        } catch (err) {
          // Silently fail
        }
      };
      
      // Fetch every 5 ticks
      if (currentTick % 5 === 0) {
        fetchRLStats();
      }
    }
  }, [isRunning, currentTick]);

  const handleStart = async () => {
    setLoading(true);
    setApiError(null);

    const response = await api.startSimulation(config);

    if (response.success) {
      setIsRunning(true);
      setApiError(null);
    } else {
      setApiError(response.error || "Failed to start simulation");
    }

    setLoading(false);
  };

  const handleStop = async () => {
    setLoading(true);
    setApiError(null);

    const response = await api.stopSimulation();

    if (response.success) {
      setIsRunning(false);
      setApiError(null);
    } else {
      setApiError(response.error || "Failed to stop simulation");
    }

    setLoading(false);
  };

  const handleReset = async () => {
    setLoading(true);
    setApiError(null);

    const response = await api.resetSimulation();

    if (response.success) {
      setIsRunning(false);
      setHistory([]);
      historyRef.current = [];
      setApiError(null);
    } else {
      setApiError(response.error || "Failed to reset simulation");
    }

    setLoading(false);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
        <Navbar 
          connectionStatus={connectionStatus} 
          isRunning={isRunning}
          tickCount={networkState?.tick || 0}
        />

        <main className="flex-1 max-w-[2560px] w-full mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Configuration Panel */}
          <ErrorBoundary>
            <ConfigurationPanel
              currentConfig={config}
              onConfigChange={setConfig}
              disabled={isRunning || loading}
            />
          </ErrorBoundary>

          {/* Control Panel */}
          <ErrorBoundary>
            <ControlPanel
              isRunning={isRunning || loading}
              onStart={handleStart}
              onStop={handleStop}
              onReset={handleReset}
            />
          </ErrorBoundary>

          {/* API Error Display */}
          {apiError && (
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-4">
              <p className="text-[#ef4444] font-medium text-sm sm:text-base">{apiError}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-xl p-4">
              <p className="text-[#6366f1] font-medium text-sm sm:text-base">Processing request...</p>
            </div>
          )}

          {/* QoS Improvement Banner */}
          <ErrorBoundary>
            <QoSImprovementBanner 
              baselineQoS={baselineQoS}
              aiQoS={aiQoS}
              rlQoS={rlQoS}
            />
          </ErrorBoundary>

          {/* Side-by-side Comparison Panels */}
          <ErrorBoundary>
            <ComparisonPanels
              baselineAllocations={baselineAllocations}
              aiAllocations={aiAllocations}
              rlAllocations={rlAllocations}
              baselineQoS={baselineQoS}
              aiQoS={aiQoS}
              rlQoS={rlQoS}
              tick={currentTick}
              explorationRate={rlStats?.exploration_rate}
            />
          </ErrorBoundary>

          {/* Error Display */}
          {error && (
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-4">
              <p className="text-[#ef4444] font-medium text-sm sm:text-base">Error: {error}</p>
            </div>
          )}

          {/* Real-time Charts */}
          <ErrorBoundary>
            <ChartsSection history={history} />
          </ErrorBoundary>

          {/* Statistics Table */}
          <ErrorBoundary>
            <StatisticsTable history={history} />
          </ErrorBoundary>

          {/* AI Explainability Panel */}
          <ErrorBoundary>
            <ExplainabilityPanel
              explanation={networkState?.explanation}
              timestamp={networkState?.explanation_timestamp}
            />
          </ErrorBoundary>
        </main>

        {/* Dashboard Footer */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
