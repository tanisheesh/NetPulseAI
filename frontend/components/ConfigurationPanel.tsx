"use client";

import { useState, useEffect } from "react";
import { SimulationConfig } from "@/lib/api";

interface ConfigurationPanelProps {
  currentConfig: SimulationConfig | null;
  onConfigChange: (config: SimulationConfig) => void;
  disabled?: boolean;
}

interface ValidationErrors {
  total_bandwidth?: string;
  base_latency?: string;
  congestion_factor?: string;
  packet_loss_rate?: string;
}

export default function ConfigurationPanel({
  currentConfig,
  onConfigChange,
  disabled = false,
}: ConfigurationPanelProps) {
  const [config, setConfig] = useState<SimulationConfig>({
    total_bandwidth: 100.0,
    base_latency: 10.0,
    congestion_factor: 1.5,
    packet_loss_rate: 2.0,
    random_seed: 42,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Update local config when currentConfig changes
  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig);
    }
  }, [currentConfig]);

  // Validation functions
  const validateBandwidth = (value: number): string | undefined => {
    if (value < 10.0 || value > 1000.0) {
      return "Bandwidth must be between 10 and 1000 Mbps";
    }
    return undefined;
  };

  const validateLatency = (value: number): string | undefined => {
    if (value < 1.0 || value > 100.0) {
      return "Base latency must be between 1 and 100 ms";
    }
    return undefined;
  };

  const validateCongestionFactor = (value: number): string | undefined => {
    if (value < 1.0 || value > 10.0) {
      return "Congestion factor must be between 1.0 and 10.0";
    }
    return undefined;
  };

  const validatePacketLoss = (value: number): string | undefined => {
    if (value < 0.0 || value > 100.0) {
      return "Packet loss rate must be between 0 and 100%";
    }
    return undefined;
  };

  const handleChange = (field: keyof SimulationConfig, value: string) => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return;
    }

    const newConfig = { ...config, [field]: numValue };
    setConfig(newConfig);

    // Validate the specific field
    const newErrors = { ...errors };
    
    switch (field) {
      case "total_bandwidth":
        newErrors.total_bandwidth = validateBandwidth(numValue);
        break;
      case "base_latency":
        newErrors.base_latency = validateLatency(numValue);
        break;
      case "congestion_factor":
        newErrors.congestion_factor = validateCongestionFactor(numValue);
        break;
      case "packet_loss_rate":
        newErrors.packet_loss_rate = validatePacketLoss(numValue);
        break;
    }

    setErrors(newErrors);

    // Only propagate valid config
    const hasErrors = Object.values(newErrors).some((error) => error !== undefined);
    if (!hasErrors) {
      onConfigChange(newConfig);
    }
  };

  const hasAnyErrors = Object.values(errors).some((error) => error !== undefined);

  return (
    <div className="bg-[#0a0a0a] backdrop-blur-sm rounded-xl border border-[#1a1a1a] p-6">
      <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
        <span>⚙</span>
        <span>Simulation Configuration</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Bandwidth */}
        <div>
          <label
            htmlFor="total_bandwidth"
            className="block text-sm font-medium text-[#f1f5f9] mb-1"
          >
            Total Bandwidth (Mbps)
          </label>
          <input
            id="total_bandwidth"
            type="number"
            min="10"
            max="1000"
            step="0.1"
            value={config.total_bandwidth}
            onChange={(e) => handleChange("total_bandwidth", e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 bg-[#1a1a1a] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4] text-[#f1f5f9] ${
              errors.total_bandwidth
                ? "border-[#ef4444]"
                : "border-[#1a1a1a]"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          {errors.total_bandwidth && (
            <p className="text-[#ef4444] text-xs mt-1">{errors.total_bandwidth}</p>
          )}
          <p className="text-[#64748b] text-xs mt-1">Range: 10 - 1000 Mbps</p>
        </div>

        {/* Base Latency */}
        <div>
          <label
            htmlFor="base_latency"
            className="block text-sm font-medium text-[#f1f5f9] mb-1"
          >
            Base Latency (ms)
          </label>
          <input
            id="base_latency"
            type="number"
            min="1"
            max="100"
            step="0.1"
            value={config.base_latency}
            onChange={(e) => handleChange("base_latency", e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 bg-[#1a1a1a] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4] text-[#f1f5f9] ${
              errors.base_latency
                ? "border-[#ef4444]"
                : "border-[#1a1a1a]"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          {errors.base_latency && (
            <p className="text-[#ef4444] text-xs mt-1">{errors.base_latency}</p>
          )}
          <p className="text-[#64748b] text-xs mt-1">Range: 1 - 100 ms</p>
        </div>

        {/* Congestion Factor */}
        <div>
          <label
            htmlFor="congestion_factor"
            className="block text-sm font-medium text-[#f1f5f9] mb-1"
          >
            Congestion Factor
          </label>
          <input
            id="congestion_factor"
            type="number"
            min="1"
            max="10"
            step="0.1"
            value={config.congestion_factor}
            onChange={(e) => handleChange("congestion_factor", e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 bg-[#1a1a1a] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4] text-[#f1f5f9] ${
              errors.congestion_factor
                ? "border-[#ef4444]"
                : "border-[#1a1a1a]"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          {errors.congestion_factor && (
            <p className="text-[#ef4444] text-xs mt-1">{errors.congestion_factor}</p>
          )}
          <p className="text-[#64748b] text-xs mt-1">Range: 1.0 - 10.0</p>
        </div>

        {/* Packet Loss Rate */}
        <div>
          <label
            htmlFor="packet_loss_rate"
            className="block text-sm font-medium text-[#f1f5f9] mb-1"
          >
            Packet Loss Rate (%)
          </label>
          <input
            id="packet_loss_rate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={config.packet_loss_rate}
            onChange={(e) => handleChange("packet_loss_rate", e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 bg-[#1a1a1a] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4] text-[#f1f5f9] ${
              errors.packet_loss_rate
                ? "border-[#ef4444]"
                : "border-[#1a1a1a]"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          {errors.packet_loss_rate && (
            <p className="text-[#ef4444] text-xs mt-1">{errors.packet_loss_rate}</p>
          )}
          <p className="text-[#64748b] text-xs mt-1">Range: 0 - 100%</p>
        </div>

        {/* Random Seed - Full Width */}
        <div className="md:col-span-2">
          <label
            htmlFor="random_seed"
            className="block text-sm font-medium text-[#f1f5f9] mb-1"
          >
            Random Seed (Optional)
          </label>
          <input
            id="random_seed"
            type="number"
            value={config.random_seed || ""}
            onChange={(e) => {
              const value = e.target.value === "" ? undefined : parseInt(e.target.value);
              setConfig({ ...config, random_seed: value });
              onConfigChange({ ...config, random_seed: value });
            }}
            disabled={disabled}
            className={`w-full px-3 py-2 bg-[#1a1a1a] border border-[#1a1a1a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4] text-[#f1f5f9] ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            placeholder="Leave empty for random"
          />
          <p className="text-[#64748b] text-xs mt-1">For reproducible simulations</p>
        </div>
      </div>

      {hasAnyErrors && (
        <div className="mt-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-3">
          <p className="text-[#ef4444] text-sm font-medium">
            Please fix validation errors before starting the simulation.
          </p>
        </div>
      )}

      {disabled && (
        <div className="mt-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-3 flex items-center gap-2">
          <span className="text-[#f59e0b]">🔒</span>
          <p className="text-[#f59e0b] text-sm">
            Configuration is locked while simulation is running. Stop the simulation to make changes.
          </p>
        </div>
      )}
    </div>
  );
}
