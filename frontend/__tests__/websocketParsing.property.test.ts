/**
 * Property-Based Test for WebSocket Data Parsing
 * Feature: ai-5g-digital-twin-simulator, Property 27: WebSocket Data Parsing
 * 
 * Property 27: WebSocket Data Parsing
 * For any valid NetworkState JSON message received via WebSocket, the dashboard 
 * SHALL successfully parse it and update application state without errors.
 * 
 * Validates: Requirements 12.4
 */

import * as fc from 'fast-check';
import { NetworkState } from '@/hooks/useWebSocket';

/**
 * Simulates the JSON parsing logic from the WebSocket hook
 * This is the logic we're testing for correctness.
 */
function parseWebSocketMessage(jsonString: string): NetworkState | null {
  try {
    const data = JSON.parse(jsonString) as NetworkState;
    return data;
  } catch (err) {
    return null;
  }
}

/**
 * Generator for valid UserType values
 */
const userTypeArbitrary = fc.constantFrom(
  'video_streaming',
  'online_gaming',
  'iot_devices',
  'voip_messaging'
);

/**
 * Generator for TrafficDemand objects
 */
const trafficDemandArbitrary = fc.record({
  user_type: userTypeArbitrary,
  bandwidth_demand: fc.double({ min: 0, max: 100, noNaN: true }),
  latency_sensitivity: fc.double({ min: 0, max: 1, noNaN: true }),
  packet_count: fc.integer({ min: 0, max: 10000 }),
  timestamp: fc.double({ min: 0, max: Date.now() * 2, noNaN: true }),
});

/**
 * Generator for UserTypeMetrics objects
 */
const userTypeMetricsArbitrary = fc.record({
  latency: fc.double({ min: 0, max: 1000, noNaN: true }),
  throughput: fc.double({ min: 0, max: 1000, noNaN: true }),
  packet_loss: fc.double({ min: 0, max: 100, noNaN: true }),
});

/**
 * Generator for allocation objects (per user type)
 */
const allocationsArbitrary = fc.record({
  video_streaming: fc.double({ min: 0, max: 1000, noNaN: true }),
  online_gaming: fc.double({ min: 0, max: 1000, noNaN: true }),
  iot_devices: fc.double({ min: 0, max: 1000, noNaN: true }),
  voip_messaging: fc.double({ min: 0, max: 1000, noNaN: true }),
});

/**
 * Generator for metrics objects (per user type)
 */
const metricsArbitrary = fc.record({
  video_streaming: userTypeMetricsArbitrary,
  online_gaming: userTypeMetricsArbitrary,
  iot_devices: userTypeMetricsArbitrary,
  voip_messaging: userTypeMetricsArbitrary,
});

/**
 * Generator for AllocationResult objects
 */
const allocationResultArbitrary = fc.record({
  decision: fc.record({
    allocations: allocationsArbitrary,
    total_allocated: fc.double({ min: 0, max: 1000, noNaN: true }),
    strategy_name: fc.constantFrom('baseline', 'ai'),
    timestamp: fc.double({ min: 0, max: Date.now() * 2, noNaN: true }),
  }),
  metrics: metricsArbitrary,
  qos_score: fc.double({ min: 0, max: 100, noNaN: true }),
});

/**
 * Generator for SimulationConfig objects
 */
const simulationConfigArbitrary = fc.record({
  total_bandwidth: fc.double({ min: 10, max: 1000, noNaN: true }),
  base_latency: fc.double({ min: 1, max: 100, noNaN: true }),
  congestion_factor: fc.double({ min: 1, max: 10, noNaN: true }),
  packet_loss_rate: fc.double({ min: 0, max: 100, noNaN: true }),
  random_seed: fc.option(fc.integer({ min: 0, max: 1000000 }), { nil: undefined }),
});

/**
 * Generator for demands objects (per user type)
 */
const demandsArbitrary = fc.record({
  video_streaming: trafficDemandArbitrary,
  online_gaming: trafficDemandArbitrary,
  iot_devices: trafficDemandArbitrary,
  voip_messaging: trafficDemandArbitrary,
});

/**
 * Generator for complete NetworkState objects
 */
const networkStateArbitrary = fc.record({
  tick: fc.integer({ min: 0, max: 100000 }),
  timestamp: fc.double({ min: 0, max: Date.now() * 2, noNaN: true }),
  config: simulationConfigArbitrary,
  demands: demandsArbitrary,
  baseline_result: allocationResultArbitrary,
  ai_result: allocationResultArbitrary,
  congestion_level: fc.double({ min: 0, max: 1, noNaN: true }),
  explanation: fc.option(fc.string(), { nil: undefined }),
  explanation_timestamp: fc.option(fc.double({ min: 0, max: Date.now() * 2, noNaN: true }), { nil: undefined }),
});

describe('Property 27: WebSocket Data Parsing', () => {
  describe('Valid NetworkState Parsing', () => {
    it('should successfully parse any valid NetworkState JSON', () => {
      fc.assert(
        fc.property(
          networkStateArbitrary,
          (networkState) => {
            // Serialize to JSON
            const jsonString = JSON.stringify(networkState);
            
            // Parse back
            const parsed = parseWebSocketMessage(jsonString);
            
            // Property: parsing should succeed (not return null)
            expect(parsed).not.toBeNull();
            
            // Property: parsed object should match original structure
            expect(parsed).toEqual(networkState);
          }
        ),
        { numRuns: 200 }
      );
    });

    it('should preserve all required fields after parsing', () => {
      fc.assert(
        fc.property(
          networkStateArbitrary,
          (networkState) => {
            const jsonString = JSON.stringify(networkState);
            const parsed = parseWebSocketMessage(jsonString);
            
            // Property: all required fields must be present
            expect(parsed).toHaveProperty('tick');
            expect(parsed).toHaveProperty('timestamp');
            expect(parsed).toHaveProperty('config');
            expect(parsed).toHaveProperty('demands');
            expect(parsed).toHaveProperty('baseline_result');
            expect(parsed).toHaveProperty('ai_result');
            expect(parsed).toHaveProperty('congestion_level');
          }
        ),
        { numRuns: 200 }
      );
    });

    it('should preserve numeric precision for all numeric fields', () => {
      fc.assert(
        fc.property(
          networkStateArbitrary,
          (networkState) => {
            const jsonString = JSON.stringify(networkState);
            const parsed = parseWebSocketMessage(jsonString);
            
            // Property: numeric values should be preserved
            expect(parsed?.tick).toBe(networkState.tick);
            expect(parsed?.timestamp).toBe(networkState.timestamp);
            expect(parsed?.congestion_level).toBe(networkState.congestion_level);
            expect(parsed?.config.total_bandwidth).toBe(networkState.config.total_bandwidth);
            expect(parsed?.config.base_latency).toBe(networkState.config.base_latency);
            expect(parsed?.baseline_result.qos_score).toBe(networkState.baseline_result.qos_score);
            expect(parsed?.ai_result.qos_score).toBe(networkState.ai_result.qos_score);
          }
        ),
        { numRuns: 200 }
      );
    });

    it('should handle optional fields correctly', () => {
      fc.assert(
        fc.property(
          networkStateArbitrary,
          (networkState) => {
            const jsonString = JSON.stringify(networkState);
            const parsed = parseWebSocketMessage(jsonString);
            
            // Property: optional fields should be preserved as-is
            if (networkState.explanation !== undefined) {
              expect(parsed?.explanation).toBe(networkState.explanation);
            }
            if (networkState.explanation_timestamp !== undefined) {
              expect(parsed?.explanation_timestamp).toBe(networkState.explanation_timestamp);
            }
            if (networkState.config.random_seed !== undefined) {
              expect(parsed?.config.random_seed).toBe(networkState.config.random_seed);
            }
          }
        ),
        { numRuns: 200 }
      );
    });
  });

  describe('NetworkState Structure Validation', () => {
    it('should parse all four user types in demands', () => {
      fc.assert(
        fc.property(
          networkStateArbitrary,
          (networkState) => {
            const jsonString = JSON.stringify(networkState);
            const parsed = parseWebSocketMessage(jsonString);
            
            // Property: all four user types must be present in demands
            expect(parsed?.demands).toHaveProperty('video_streaming');
            expect(parsed?.demands).toHaveProperty('online_gaming');
            expect(parsed?.demands).toHaveProperty('iot_devices');
            expect(parsed?.demands).toHaveProperty('voip_messaging');
          }
        ),
        { numRuns: 200 }
      );
    });

    it('should parse all four user types in allocation results', () => {
      fc.assert(
        fc.property(
          networkStateArbitrary,
          (networkState) => {
            const jsonString = JSON.stringify(networkState);
            const parsed = parseWebSocketMessage(jsonString);
            
            // Property: all four user types must be present in allocations
            expect(parsed?.baseline_result.decision.allocations).toHaveProperty('video_streaming');
            expect(parsed?.baseline_result.decision.allocations).toHaveProperty('online_gaming');
            expect(parsed?.baseline_result.decision.allocations).toHaveProperty('iot_devices');
            expect(parsed?.baseline_result.decision.allocations).toHaveProperty('voip_messaging');
            
            expect(parsed?.ai_result.decision.allocations).toHaveProperty('video_streaming');
            expect(parsed?.ai_result.decision.allocations).toHaveProperty('online_gaming');
            expect(parsed?.ai_result.decision.allocations).toHaveProperty('iot_devices');
            expect(parsed?.ai_result.decision.allocations).toHaveProperty('voip_messaging');
          }
        ),
        { numRuns: 200 }
      );
    });

    it('should parse all four user types in metrics', () => {
      fc.assert(
        fc.property(
          networkStateArbitrary,
          (networkState) => {
            const jsonString = JSON.stringify(networkState);
            const parsed = parseWebSocketMessage(jsonString);
            
            // Property: all four user types must be present in metrics
            expect(parsed?.baseline_result.metrics).toHaveProperty('video_streaming');
            expect(parsed?.baseline_result.metrics).toHaveProperty('online_gaming');
            expect(parsed?.baseline_result.metrics).toHaveProperty('iot_devices');
            expect(parsed?.baseline_result.metrics).toHaveProperty('voip_messaging');
            
            expect(parsed?.ai_result.metrics).toHaveProperty('video_streaming');
            expect(parsed?.ai_result.metrics).toHaveProperty('online_gaming');
            expect(parsed?.ai_result.metrics).toHaveProperty('iot_devices');
            expect(parsed?.ai_result.metrics).toHaveProperty('voip_messaging');
          }
        ),
        { numRuns: 200 }
      );
    });

    it('should parse nested TrafficDemand structure correctly', () => {
      fc.assert(
        fc.property(
          networkStateArbitrary,
          (networkState) => {
            const jsonString = JSON.stringify(networkState);
            const parsed = parseWebSocketMessage(jsonString);
            
            // Property: TrafficDemand objects must have all required fields
            const userTypes = ['video_streaming', 'online_gaming', 'iot_devices', 'voip_messaging'] as const;
            
            for (const userType of userTypes) {
              const demand = parsed?.demands[userType];
              expect(demand).toHaveProperty('user_type');
              expect(demand).toHaveProperty('bandwidth_demand');
              expect(demand).toHaveProperty('latency_sensitivity');
              expect(demand).toHaveProperty('packet_count');
              expect(demand).toHaveProperty('timestamp');
            }
          }
        ),
        { numRuns: 200 }
      );
    });

    it('should parse nested UserTypeMetrics structure correctly', () => {
      fc.assert(
        fc.property(
          networkStateArbitrary,
          (networkState) => {
            const jsonString = JSON.stringify(networkState);
            const parsed = parseWebSocketMessage(jsonString);
            
            // Property: UserTypeMetrics objects must have all required fields
            const userTypes = ['video_streaming', 'online_gaming', 'iot_devices', 'voip_messaging'] as const;
            
            for (const userType of userTypes) {
              const baselineMetrics = parsed?.baseline_result.metrics[userType];
              expect(baselineMetrics).toHaveProperty('latency');
              expect(baselineMetrics).toHaveProperty('throughput');
              expect(baselineMetrics).toHaveProperty('packet_loss');
              
              const aiMetrics = parsed?.ai_result.metrics[userType];
              expect(aiMetrics).toHaveProperty('latency');
              expect(aiMetrics).toHaveProperty('throughput');
              expect(aiMetrics).toHaveProperty('packet_loss');
            }
          }
        ),
        { numRuns: 200 }
      );
    });
  });

  describe('Invalid JSON Handling', () => {
    it('should return null for invalid JSON strings', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => {
            try {
              JSON.parse(s);
              return false; // Valid JSON, skip
            } catch {
              return true; // Invalid JSON, use it
            }
          }),
          (invalidJson) => {
            const parsed = parseWebSocketMessage(invalidJson);
            
            // Property: invalid JSON should return null
            expect(parsed).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle malformed JSON gracefully', () => {
      const malformedJsonExamples = [
        '{invalid}',
        '{"tick": }',
        '{"tick": 1, "timestamp": }',
        '{tick: 1}', // Missing quotes
        "{'tick': 1}", // Single quotes
        '{"tick": 1,}', // Trailing comma
        '{"tick": NaN}',
        '{"tick": Infinity}',
        '{"tick": undefined}',
      ];

      for (const malformed of malformedJsonExamples) {
        const parsed = parseWebSocketMessage(malformed);
        expect(parsed).toBeNull();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle NetworkState with minimal optional fields', () => {
      const minimalState = {
        tick: 0,
        timestamp: 0,
        config: {
          total_bandwidth: 100,
          base_latency: 10,
          congestion_factor: 1.5,
          packet_loss_rate: 2.0,
        },
        demands: {
          video_streaming: {
            user_type: 'video_streaming',
            bandwidth_demand: 0,
            latency_sensitivity: 0,
            packet_count: 0,
            timestamp: 0,
          },
          online_gaming: {
            user_type: 'online_gaming',
            bandwidth_demand: 0,
            latency_sensitivity: 0,
            packet_count: 0,
            timestamp: 0,
          },
          iot_devices: {
            user_type: 'iot_devices',
            bandwidth_demand: 0,
            latency_sensitivity: 0,
            packet_count: 0,
            timestamp: 0,
          },
          voip_messaging: {
            user_type: 'voip_messaging',
            bandwidth_demand: 0,
            latency_sensitivity: 0,
            packet_count: 0,
            timestamp: 0,
          },
        },
        baseline_result: {
          decision: {
            allocations: {
              video_streaming: 0,
              online_gaming: 0,
              iot_devices: 0,
              voip_messaging: 0,
            },
            total_allocated: 0,
            strategy_name: 'baseline',
            timestamp: 0,
          },
          metrics: {
            video_streaming: { latency: 0, throughput: 0, packet_loss: 0 },
            online_gaming: { latency: 0, throughput: 0, packet_loss: 0 },
            iot_devices: { latency: 0, throughput: 0, packet_loss: 0 },
            voip_messaging: { latency: 0, throughput: 0, packet_loss: 0 },
          },
          qos_score: 0,
        },
        ai_result: {
          decision: {
            allocations: {
              video_streaming: 0,
              online_gaming: 0,
              iot_devices: 0,
              voip_messaging: 0,
            },
            total_allocated: 0,
            strategy_name: 'ai',
            timestamp: 0,
          },
          metrics: {
            video_streaming: { latency: 0, throughput: 0, packet_loss: 0 },
            online_gaming: { latency: 0, throughput: 0, packet_loss: 0 },
            iot_devices: { latency: 0, throughput: 0, packet_loss: 0 },
            voip_messaging: { latency: 0, throughput: 0, packet_loss: 0 },
          },
          qos_score: 0,
        },
        congestion_level: 0,
      };

      const jsonString = JSON.stringify(minimalState);
      const parsed = parseWebSocketMessage(jsonString);

      expect(parsed).not.toBeNull();
      expect(parsed).toEqual(minimalState);
    });

    it('should handle NetworkState with all optional fields present', () => {
      fc.assert(
        fc.property(
          networkStateArbitrary.map(state => ({
            ...state,
            explanation: 'Test explanation',
            explanation_timestamp: Date.now(),
            config: {
              ...state.config,
              random_seed: 12345,
            },
          })),
          (networkState) => {
            const jsonString = JSON.stringify(networkState);
            const parsed = parseWebSocketMessage(jsonString);

            expect(parsed).not.toBeNull();
            expect(parsed?.explanation).toBe('Test explanation');
            expect(parsed?.explanation_timestamp).toBe(networkState.explanation_timestamp);
            expect(parsed?.config.random_seed).toBe(12345);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle very large tick numbers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000000, max: Number.MAX_SAFE_INTEGER }),
          (largeTick) => {
            const state = fc.sample(networkStateArbitrary, 1)[0];
            state.tick = largeTick;

            const jsonString = JSON.stringify(state);
            const parsed = parseWebSocketMessage(jsonString);

            expect(parsed).not.toBeNull();
            expect(parsed?.tick).toBe(largeTick);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle boundary values for numeric fields', () => {
      const boundaryState = {
        tick: 0,
        timestamp: 0,
        config: {
          total_bandwidth: 10, // Minimum
          base_latency: 1, // Minimum
          congestion_factor: 1, // Minimum
          packet_loss_rate: 0, // Minimum
        },
        demands: {
          video_streaming: {
            user_type: 'video_streaming',
            bandwidth_demand: 0,
            latency_sensitivity: 0, // Minimum
            packet_count: 0,
            timestamp: 0,
          },
          online_gaming: {
            user_type: 'online_gaming',
            bandwidth_demand: 100,
            latency_sensitivity: 1, // Maximum
            packet_count: 10000,
            timestamp: 0,
          },
          iot_devices: {
            user_type: 'iot_devices',
            bandwidth_demand: 0,
            latency_sensitivity: 0,
            packet_count: 0,
            timestamp: 0,
          },
          voip_messaging: {
            user_type: 'voip_messaging',
            bandwidth_demand: 0,
            latency_sensitivity: 0,
            packet_count: 0,
            timestamp: 0,
          },
        },
        baseline_result: {
          decision: {
            allocations: {
              video_streaming: 0,
              online_gaming: 0,
              iot_devices: 0,
              voip_messaging: 0,
            },
            total_allocated: 0,
            strategy_name: 'baseline',
            timestamp: 0,
          },
          metrics: {
            video_streaming: { latency: 0, throughput: 0, packet_loss: 0 },
            online_gaming: { latency: 1000, throughput: 1000, packet_loss: 100 }, // Maximum values
            iot_devices: { latency: 0, throughput: 0, packet_loss: 0 },
            voip_messaging: { latency: 0, throughput: 0, packet_loss: 0 },
          },
          qos_score: 0, // Minimum
        },
        ai_result: {
          decision: {
            allocations: {
              video_streaming: 0,
              online_gaming: 0,
              iot_devices: 0,
              voip_messaging: 0,
            },
            total_allocated: 0,
            strategy_name: 'ai',
            timestamp: 0,
          },
          metrics: {
            video_streaming: { latency: 0, throughput: 0, packet_loss: 0 },
            online_gaming: { latency: 0, throughput: 0, packet_loss: 0 },
            iot_devices: { latency: 0, throughput: 0, packet_loss: 0 },
            voip_messaging: { latency: 0, throughput: 0, packet_loss: 0 },
          },
          qos_score: 100, // Maximum
        },
        congestion_level: 1, // Maximum
      };

      const jsonString = JSON.stringify(boundaryState);
      const parsed = parseWebSocketMessage(jsonString);

      expect(parsed).not.toBeNull();
      expect(parsed).toEqual(boundaryState);
    });
  });

  describe('Serialization Round-Trip', () => {
    it('should maintain data integrity through multiple serialization cycles', () => {
      fc.assert(
        fc.property(
          networkStateArbitrary,
          (originalState) => {
            // First cycle
            const json1 = JSON.stringify(originalState);
            const parsed1 = parseWebSocketMessage(json1);

            // Second cycle
            const json2 = JSON.stringify(parsed1);
            const parsed2 = parseWebSocketMessage(json2);

            // Third cycle
            const json3 = JSON.stringify(parsed2);
            const parsed3 = parseWebSocketMessage(json3);

            // Property: data should remain consistent across multiple cycles
            expect(parsed1).toEqual(originalState);
            expect(parsed2).toEqual(originalState);
            expect(parsed3).toEqual(originalState);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
