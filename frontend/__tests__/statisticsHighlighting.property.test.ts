/**
 * Property-Based Tests for Statistics Highlighting Logic
 * 
 * Feature: ai-5g-digital-twin-simulator
 * Property 28: Statistics Highlighting Logic
 * 
 * Tests the correctness of the highlighting logic that determines when
 * AI allocator outperforms baseline allocator for different metrics.
 * 
 * Validates: Requirements 13.4
 */

import * as fc from 'fast-check';
import {
  isLatencyBetter,
  isThroughputBetter,
  isPacketLossBetter,
  shouldHighlightCell,
} from '@/lib/statisticsHighlighting';

describe('Property 28: Statistics Highlighting Logic', () => {
  describe('Latency Highlighting', () => {
    it('should highlight when AI latency is strictly less than baseline', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1000, noNaN: true }),
          fc.float({ min: 0, max: 1000, noNaN: true }),
          (baseline, ai) => {
            const result = isLatencyBetter(baseline, ai);
            
            // Property: highlight if and only if AI < baseline
            if (ai < baseline) {
              expect(result).toBe(true);
            } else {
              expect(result).toBe(false);
            }
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should not highlight when AI latency equals baseline', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1000, noNaN: true }),
          (value) => {
            const result = isLatencyBetter(value, value);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not highlight when AI latency is greater than baseline', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1000, noNaN: true }),
          fc.float({ min: Math.fround(0.01), max: 100, noNaN: true }),
          (baseline, delta) => {
            const ai = baseline + delta;
            const result = isLatencyBetter(baseline, ai);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Throughput Highlighting', () => {
    it('should highlight when AI throughput is strictly greater than baseline', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1000, noNaN: true }),
          fc.float({ min: 0, max: 1000, noNaN: true }),
          (baseline, ai) => {
            const result = isThroughputBetter(baseline, ai);
            
            // Property: highlight if and only if AI > baseline
            if (ai > baseline) {
              expect(result).toBe(true);
            } else {
              expect(result).toBe(false);
            }
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should not highlight when AI throughput equals baseline', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1000, noNaN: true }),
          (value) => {
            const result = isThroughputBetter(value, value);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not highlight when AI throughput is less than baseline', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.01), max: 1000, noNaN: true }),
          fc.float({ min: Math.fround(0.01), max: 100, noNaN: true }),
          (baseline, delta) => {
            const ai = baseline - delta;
            if (ai >= 0) {
              const result = isThroughputBetter(baseline, ai);
              expect(result).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Packet Loss Highlighting', () => {
    it('should highlight when AI packet loss is strictly less than baseline', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }),
          fc.float({ min: 0, max: 100, noNaN: true }),
          (baseline, ai) => {
            const result = isPacketLossBetter(baseline, ai);
            
            // Property: highlight if and only if AI < baseline
            if (ai < baseline) {
              expect(result).toBe(true);
            } else {
              expect(result).toBe(false);
            }
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should not highlight when AI packet loss equals baseline', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }),
          (value) => {
            const result = isPacketLossBetter(value, value);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not highlight when AI packet loss is greater than baseline', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 99, noNaN: true }),
          fc.float({ min: Math.fround(0.01), max: 1, noNaN: true }),
          (baseline, delta) => {
            const ai = Math.min(baseline + delta, 100);
            const result = isPacketLossBetter(baseline, ai);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unified shouldHighlightCell Function', () => {
    it('should correctly route to latency logic for latency metric', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1000, noNaN: true }),
          fc.float({ min: 0, max: 1000, noNaN: true }),
          (baseline, ai) => {
            const result = shouldHighlightCell('latency', baseline, ai);
            const expected = isLatencyBetter(baseline, ai);
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 500 }
      );
    });

    it('should correctly route to throughput logic for throughput metric', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1000, noNaN: true }),
          fc.float({ min: 0, max: 1000, noNaN: true }),
          (baseline, ai) => {
            const result = shouldHighlightCell('throughput', baseline, ai);
            const expected = isThroughputBetter(baseline, ai);
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 500 }
      );
    });

    it('should correctly route to packet loss logic for packetLoss metric', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }),
          fc.float({ min: 0, max: 100, noNaN: true }),
          (baseline, ai) => {
            const result = shouldHighlightCell('packetLoss', baseline, ai);
            const expected = isPacketLossBetter(baseline, ai);
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 500 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values correctly', () => {
      // Latency: 0 < 0 = false
      expect(isLatencyBetter(0, 0)).toBe(false);
      
      // Throughput: 0 > 0 = false
      expect(isThroughputBetter(0, 0)).toBe(false);
      
      // Packet Loss: 0 < 0 = false
      expect(isPacketLossBetter(0, 0)).toBe(false);
    });

    it('should handle very small differences correctly', () => {
      const epsilon = 0.0001;
      
      // Latency: AI slightly better
      expect(isLatencyBetter(10, 10 - epsilon)).toBe(true);
      expect(isLatencyBetter(10, 10 + epsilon)).toBe(false);
      
      // Throughput: AI slightly better
      expect(isThroughputBetter(10, 10 + epsilon)).toBe(true);
      expect(isThroughputBetter(10, 10 - epsilon)).toBe(false);
      
      // Packet Loss: AI slightly better
      expect(isPacketLossBetter(10, 10 - epsilon)).toBe(true);
      expect(isPacketLossBetter(10, 10 + epsilon)).toBe(false);
    });

    it('should handle large values correctly', () => {
      // Latency
      expect(isLatencyBetter(1000, 999)).toBe(true);
      expect(isLatencyBetter(1000, 1001)).toBe(false);
      
      // Throughput
      expect(isThroughputBetter(1000, 1001)).toBe(true);
      expect(isThroughputBetter(1000, 999)).toBe(false);
      
      // Packet Loss
      expect(isPacketLossBetter(100, 99)).toBe(true);
      expect(isPacketLossBetter(99, 100)).toBe(false);
    });
  });

  describe('Consistency Properties', () => {
    it('should be consistent: if AI is better, baseline is not better (latency)', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1000, noNaN: true }),
          fc.float({ min: 0, max: 1000, noNaN: true }),
          (baseline, ai) => {
            const aiBetter = isLatencyBetter(baseline, ai);
            const baselineBetter = isLatencyBetter(ai, baseline);
            
            // They cannot both be better
            expect(aiBetter && baselineBetter).toBe(false);
          }
        ),
        { numRuns: 500 }
      );
    });

    it('should be consistent: if AI is better, baseline is not better (throughput)', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1000, noNaN: true }),
          fc.float({ min: 0, max: 1000, noNaN: true }),
          (baseline, ai) => {
            const aiBetter = isThroughputBetter(baseline, ai);
            const baselineBetter = isThroughputBetter(ai, baseline);
            
            // They cannot both be better
            expect(aiBetter && baselineBetter).toBe(false);
          }
        ),
        { numRuns: 500 }
      );
    });

    it('should be consistent: if AI is better, baseline is not better (packet loss)', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }),
          fc.float({ min: 0, max: 100, noNaN: true }),
          (baseline, ai) => {
            const aiBetter = isPacketLossBetter(baseline, ai);
            const baselineBetter = isPacketLossBetter(ai, baseline);
            
            // They cannot both be better
            expect(aiBetter && baselineBetter).toBe(false);
          }
        ),
        { numRuns: 500 }
      );
    });

    it('should be transitive: if A < B and B < C, then A < C (latency)', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1000, noNaN: true }),
          fc.float({ min: 0, max: 1000, noNaN: true }),
          fc.float({ min: 0, max: 1000, noNaN: true }),
          (a, b, c) => {
            // Sort to ensure a <= b <= c
            const sorted = [a, b, c].sort((x, y) => x - y);
            const [low, mid, high] = sorted;
            
            if (low < mid && mid < high) {
              // If low is better than mid, and mid is better than high
              expect(isLatencyBetter(mid, low)).toBe(true);
              expect(isLatencyBetter(high, mid)).toBe(true);
              // Then low should be better than high
              expect(isLatencyBetter(high, low)).toBe(true);
            }
          }
        ),
        { numRuns: 500 }
      );
    });
  });

  describe('Requirement Validation', () => {
    it('validates Requirement 13.4: highlight cells where AI outperforms baseline', () => {
      // Test all three metric types with various scenarios
      const testCases = [
        // Latency: lower is better
        { metric: 'latency' as const, baseline: 50, ai: 30, shouldHighlight: true },
        { metric: 'latency' as const, baseline: 50, ai: 50, shouldHighlight: false },
        { metric: 'latency' as const, baseline: 50, ai: 70, shouldHighlight: false },
        
        // Throughput: higher is better
        { metric: 'throughput' as const, baseline: 50, ai: 70, shouldHighlight: true },
        { metric: 'throughput' as const, baseline: 50, ai: 50, shouldHighlight: false },
        { metric: 'throughput' as const, baseline: 50, ai: 30, shouldHighlight: false },
        
        // Packet Loss: lower is better
        { metric: 'packetLoss' as const, baseline: 5, ai: 2, shouldHighlight: true },
        { metric: 'packetLoss' as const, baseline: 5, ai: 5, shouldHighlight: false },
        { metric: 'packetLoss' as const, baseline: 5, ai: 8, shouldHighlight: false },
      ];

      testCases.forEach(({ metric, baseline, ai, shouldHighlight }) => {
        const result = shouldHighlightCell(metric, baseline, ai);
        expect(result).toBe(shouldHighlight);
      });
    });
  });
});
