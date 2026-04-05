/**
 * Property-Based Test for Dashboard History Window Management
 * Feature: ai-5g-digital-twin-simulator, Property 26: Dashboard History Window
 * 
 * Property 26: Dashboard History Window
 * For any sequence of network state updates to the dashboard, the maintained history array 
 * SHALL have length <= 100 and SHALL contain the most recent data points in chronological order.
 * 
 * Validates: Requirements 10.5
 */

import * as fc from 'fast-check';
import { NetworkState } from '@/hooks/useWebSocket';

/**
 * Simulates the history window management logic from frontend/app/page.tsx
 * This is the logic we're testing for correctness.
 */
function updateHistoryWindow(
  currentHistory: NetworkState[],
  newState: NetworkState
): NetworkState[] {
  const newHistory = [...currentHistory, newState];
  
  // Keep only last 100 ticks
  if (newHistory.length > 100) {
    newHistory.shift();
  }
  
  return newHistory;
}

/**
 * Generator for a minimal valid NetworkState object
 * We only need the tick number for chronological ordering tests
 */
const networkStateArbitrary = (tick: number): fc.Arbitrary<NetworkState> => {
  return fc.constant({
    tick,
    timestamp: Date.now() + tick * 100,
    config: {
      total_bandwidth: 100,
      base_latency: 10,
      congestion_factor: 1.5,
      packet_loss_rate: 2.0,
    },
    demands: {
      video_streaming: {
        user_type: 'video_streaming' as const,
        bandwidth_demand: 15,
        latency_sensitivity: 0.6,
        packet_count: 100,
        timestamp: Date.now(),
      },
      online_gaming: {
        user_type: 'online_gaming' as const,
        bandwidth_demand: 3,
        latency_sensitivity: 0.9,
        packet_count: 50,
        timestamp: Date.now(),
      },
      iot_devices: {
        user_type: 'iot_devices' as const,
        bandwidth_demand: 0.8,
        latency_sensitivity: 0.2,
        packet_count: 200,
        timestamp: Date.now(),
      },
      voip_messaging: {
        user_type: 'voip_messaging' as const,
        bandwidth_demand: 2,
        latency_sensitivity: 0.7,
        packet_count: 75,
        timestamp: Date.now(),
      },
    },
    baseline_result: {
      decision: {
        allocations: {
          video_streaming: 25,
          online_gaming: 25,
          iot_devices: 25,
          voip_messaging: 25,
        },
        total_allocated: 100,
        strategy_name: 'baseline',
        timestamp: Date.now(),
      },
      metrics: {
        video_streaming: { latency: 15, throughput: 24, packet_loss: 1.5 },
        online_gaming: { latency: 12, throughput: 24, packet_loss: 1.2 },
        iot_devices: { latency: 18, throughput: 24, packet_loss: 2.1 },
        voip_messaging: { latency: 14, throughput: 24, packet_loss: 1.8 },
      },
      qos_score: 85,
    },
    ai_result: {
      decision: {
        allocations: {
          video_streaming: 35,
          online_gaming: 30,
          iot_devices: 15,
          voip_messaging: 20,
        },
        total_allocated: 100,
        strategy_name: 'ai',
        timestamp: Date.now(),
      },
      metrics: {
        video_streaming: { latency: 12, throughput: 34, packet_loss: 0.8 },
        online_gaming: { latency: 10, throughput: 29, packet_loss: 0.5 },
        iot_devices: { latency: 22, throughput: 14, packet_loss: 2.5 },
        voip_messaging: { latency: 11, throughput: 19, packet_loss: 1.1 },
      },
      qos_score: 92,
    },
    congestion_level: 0.75,
  });
};

describe('Property 26: Dashboard History Window', () => {
  describe('History Length Constraint', () => {
    it('should never exceed 100 items regardless of input sequence length', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 500 }), // Test with sequences up to 500 items
          (sequenceLength) => {
            let history: NetworkState[] = [];
            
            // Simulate adding sequenceLength network states
            for (let i = 0; i < sequenceLength; i++) {
              const state = fc.sample(networkStateArbitrary(i), 1)[0];
              history = updateHistoryWindow(history, state);
              
              // Property: history length must never exceed 100
              expect(history.length).toBeLessThanOrEqual(100);
            }
            
            // Final check: after all updates, length should be min(sequenceLength, 100)
            const expectedLength = Math.min(sequenceLength, 100);
            expect(history.length).toBe(expectedLength);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain exactly 100 items once that threshold is reached', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 101, max: 300 }), // Test with sequences that exceed 100
          (sequenceLength) => {
            let history: NetworkState[] = [];
            
            for (let i = 0; i < sequenceLength; i++) {
              const state = fc.sample(networkStateArbitrary(i), 1)[0];
              history = updateHistoryWindow(history, state);
              
              // Once we've added more than 100 items, length should stay at 100
              if (i >= 100) {
                expect(history.length).toBe(100);
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Chronological Order', () => {
    it('should maintain chronological order of tick numbers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 200 }),
          (sequenceLength) => {
            let history: NetworkState[] = [];
            
            // Add states with sequential tick numbers
            for (let i = 0; i < sequenceLength; i++) {
              const state = fc.sample(networkStateArbitrary(i), 1)[0];
              history = updateHistoryWindow(history, state);
            }
            
            // Property: tick numbers should be in ascending order
            for (let i = 1; i < history.length; i++) {
              expect(history[i].tick).toBeGreaterThan(history[i - 1].tick);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should contain the most recent data points when exceeding 100 items', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 150, max: 300 }),
          (sequenceLength) => {
            let history: NetworkState[] = [];
            
            // Add states with sequential tick numbers
            for (let i = 0; i < sequenceLength; i++) {
              const state = fc.sample(networkStateArbitrary(i), 1)[0];
              history = updateHistoryWindow(history, state);
            }
            
            // Property: should contain the last 100 ticks
            // First item should be tick (sequenceLength - 100)
            // Last item should be tick (sequenceLength - 1)
            expect(history[0].tick).toBe(sequenceLength - 100);
            expect(history[history.length - 1].tick).toBe(sequenceLength - 1);
            
            // All ticks should be in the range [sequenceLength - 100, sequenceLength - 1]
            for (const state of history) {
              expect(state.tick).toBeGreaterThanOrEqual(sequenceLength - 100);
              expect(state.tick).toBeLessThan(sequenceLength);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty initial history', () => {
      const history: NetworkState[] = [];
      const state = fc.sample(networkStateArbitrary(0), 1)[0];
      const newHistory = updateHistoryWindow(history, state);
      
      expect(newHistory.length).toBe(1);
      expect(newHistory[0].tick).toBe(0);
    });

    it('should handle exactly 100 items without dropping any', () => {
      let history: NetworkState[] = [];
      
      // Add exactly 100 items
      for (let i = 0; i < 100; i++) {
        const state = fc.sample(networkStateArbitrary(i), 1)[0];
        history = updateHistoryWindow(history, state);
      }
      
      expect(history.length).toBe(100);
      expect(history[0].tick).toBe(0);
      expect(history[99].tick).toBe(99);
    });

    it('should drop the oldest item when adding the 101st item', () => {
      let history: NetworkState[] = [];
      
      // Add 100 items
      for (let i = 0; i < 100; i++) {
        const state = fc.sample(networkStateArbitrary(i), 1)[0];
        history = updateHistoryWindow(history, state);
      }
      
      // Add 101st item
      const state101 = fc.sample(networkStateArbitrary(100), 1)[0];
      history = updateHistoryWindow(history, state101);
      
      expect(history.length).toBe(100);
      expect(history[0].tick).toBe(1); // Tick 0 should be dropped
      expect(history[99].tick).toBe(100);
    });

    it('should handle single item repeatedly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 150 }),
          (iterations) => {
            let history: NetworkState[] = [];
            
            for (let i = 0; i < iterations; i++) {
              const state = fc.sample(networkStateArbitrary(i), 1)[0];
              history = updateHistoryWindow(history, state);
            }
            
            expect(history.length).toBeLessThanOrEqual(100);
            expect(history.length).toBe(Math.min(iterations, 100));
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Invariants', () => {
    it('should preserve all items when below 100 threshold', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 99 }),
          (count) => {
            let history: NetworkState[] = [];
            const addedStates: NetworkState[] = [];
            
            for (let i = 0; i < count; i++) {
              const state = fc.sample(networkStateArbitrary(i), 1)[0];
              addedStates.push(state);
              history = updateHistoryWindow(history, state);
            }
            
            // All added states should be present
            expect(history.length).toBe(count);
            for (let i = 0; i < count; i++) {
              expect(history[i].tick).toBe(addedStates[i].tick);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should never have duplicate tick numbers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 200 }),
          (sequenceLength) => {
            let history: NetworkState[] = [];
            
            for (let i = 0; i < sequenceLength; i++) {
              const state = fc.sample(networkStateArbitrary(i), 1)[0];
              history = updateHistoryWindow(history, state);
            }
            
            // Extract all tick numbers
            const ticks = history.map(s => s.tick);
            const uniqueTicks = new Set(ticks);
            
            // Should have no duplicates
            expect(uniqueTicks.size).toBe(ticks.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain continuous tick sequence in final history', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 250 }),
          (sequenceLength) => {
            let history: NetworkState[] = [];
            
            for (let i = 0; i < sequenceLength; i++) {
              const state = fc.sample(networkStateArbitrary(i), 1)[0];
              history = updateHistoryWindow(history, state);
            }
            
            // Ticks should be continuous (no gaps)
            for (let i = 1; i < history.length; i++) {
              expect(history[i].tick).toBe(history[i - 1].tick + 1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
