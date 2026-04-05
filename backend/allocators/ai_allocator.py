"""
AI-powered allocator for AI-Based 5G Digital Twin Network Simulator.

This module implements an intelligent weighted priority allocation strategy
that optimizes for QoS by considering user type characteristics, latency
requirements, and network congestion levels.
"""

import time
from typing import Dict

from models import UserType, TrafficDemand, AllocationDecision


class AIAllocator:
    """
    Intelligent weighted priority bandwidth allocation strategy.
    
    Applies sophisticated heuristics to optimize QoS by:
    - Prioritizing latency-sensitive traffic (gaming, VoIP)
    - Allocating proportional bandwidth for high-demand users (video)
    - Dynamically adjusting priorities during high congestion
    - Respecting total bandwidth cap constraints
    
    The allocator uses priority weights that can be dynamically updated
    by the Groq Override Layer based on AI recommendations.
    
    Characteristics:
    - Intelligent: Considers traffic characteristics and network state
    - Adaptive: Dynamic priority adjustment during congestion
    - Fast: Completes allocation in <10ms
    - Optimized: Maximizes aggregate QoS across all user types
    """
    
    def __init__(self):
        """
        Initialize AI allocator with default priority weights.
        
        Default weights are based on typical 5G QoS requirements:
        - Gaming: 1.5 (highest - ultra-low latency critical)
        - Video: 1.3 (high - bandwidth-intensive)
        - VoIP: 1.1 (moderate-high - real-time communication)
        - IoT: 0.8 (lowest - tolerant of delays)
        """
        self.strategy_name = "AI Weighted Priority"
        self.priority_weights = {
            UserType.ONLINE_GAMING: 1.5,    # Latency-sensitive
            UserType.VIDEO_STREAMING: 1.3,  # Bandwidth-intensive
            UserType.VOIP_MESSAGING: 1.1,   # Real-time
            UserType.IOT_DEVICES: 0.8       # Tolerant
        }
        self.congestion_threshold = 0.8  # 80% capacity
    
    def allocate(
        self,
        total_bandwidth: float,
        demands: Dict[UserType, TrafficDemand],
        congestion_level: float = 0.0
    ) -> AllocationDecision:
        """
        Allocate bandwidth using weighted priority heuristics.
        
        The allocation algorithm:
        1. Calculate effective weights (base weights + congestion adjustments)
        2. Compute weighted demand for each user type
        3. Distribute bandwidth proportionally to weighted demands
        4. Ensure total allocation respects bandwidth cap
        
        During high congestion (>80%), the algorithm applies dynamic priority
        adjustment to further favor latency-sensitive traffic.
        
        Args:
            total_bandwidth: Total available bandwidth in Mbps.
            demands: Dictionary mapping UserType to TrafficDemand for current tick.
            congestion_level: Current network congestion as fraction (0.0-1.0).
        
        Returns:
            AllocationDecision with optimized bandwidth allocation.
            
        Performance:
            Execution time: <10ms per allocation (typically <1ms)
        
        Example:
            >>> allocator = AIAllocator()
            >>> demands = {user_type: traffic_demand for user_type in UserType}
            >>> decision = allocator.allocate(100.0, demands, congestion_level=0.5)
            >>> decision.allocations[UserType.ONLINE_GAMING]  # Higher allocation
            30.5
        """
        # Calculate effective weights with congestion adjustment
        effective_weights = self._calculate_effective_weights(congestion_level)
        
        # Calculate weighted demands
        weighted_demands = {}
        total_weighted_demand = 0.0
        
        for user_type, demand in demands.items():
            # Weight the bandwidth demand by priority and latency sensitivity
            weight = effective_weights[user_type]
            latency_factor = 1.0 + (demand.latency_sensitivity * 0.5)  # 1.0-1.5x boost
            weighted_demand = demand.bandwidth_demand * weight * latency_factor
            
            weighted_demands[user_type] = weighted_demand
            total_weighted_demand += weighted_demand
        
        # Allocate bandwidth proportionally to weighted demands
        allocations = {}
        
        if total_weighted_demand > 0:
            for user_type, weighted_demand in weighted_demands.items():
                # Proportional allocation based on weighted demand
                proportion = weighted_demand / total_weighted_demand
                allocated = total_bandwidth * proportion
                allocations[user_type] = round(allocated, 2)
        else:
            # Fallback to equal split if no demands
            bandwidth_per_type = total_bandwidth / len(UserType)
            allocations = {user_type: bandwidth_per_type for user_type in UserType}
        
        # Ensure total doesn't exceed bandwidth cap due to rounding
        total_allocated = sum(allocations.values())
        if total_allocated > total_bandwidth:
            # Adjust largest allocation to respect cap
            max_user_type = max(allocations, key=allocations.get)
            excess = total_allocated - total_bandwidth
            allocations[max_user_type] = round(allocations[max_user_type] - excess, 2)
            total_allocated = total_bandwidth
        
        return AllocationDecision(
            allocations=allocations,
            total_allocated=round(total_allocated, 2),
            strategy_name=self.strategy_name,
            timestamp=time.time()
        )
    
    def update_weights(self, new_weights: Dict[UserType, float]) -> None:
        """
        Update priority weights dynamically based on external recommendations.
        
        This method is called by the Groq Override Layer after receiving
        strategic recommendations from the AI. It allows the allocator to
        adapt its strategy based on observed network patterns and AI insights.
        
        Args:
            new_weights: Dictionary mapping UserType to new priority weights.
                        Weights should typically be in range 0.5-2.0.
        
        Example:
            >>> allocator = AIAllocator()
            >>> allocator.update_weights({
            ...     UserType.ONLINE_GAMING: 1.8,
            ...     UserType.VIDEO_STREAMING: 1.2,
            ...     UserType.VOIP_MESSAGING: 1.0,
            ...     UserType.IOT_DEVICES: 0.6
            ... })
        """
        for user_type, weight in new_weights.items():
            if user_type in self.priority_weights:
                self.priority_weights[user_type] = weight
    
    def _calculate_effective_weights(self, congestion_level: float) -> Dict[UserType, float]:
        """
        Calculate effective weights with congestion adjustment.
        
        When congestion exceeds 80%, apply additional boost to latency-sensitive
        traffic (gaming and VoIP) to maintain QoS during network stress.
        
        Args:
            congestion_level: Current network congestion as fraction (0.0-1.0).
        
        Returns:
            Dictionary mapping UserType to effective priority weights.
        """
        effective_weights = self.priority_weights.copy()
        
        if congestion_level > self.congestion_threshold:
            # Calculate congestion severity (0.0-1.0 above threshold)
            severity = (congestion_level - self.congestion_threshold) / (1.0 - self.congestion_threshold)
            
            # Boost latency-sensitive traffic during congestion
            # Gaming gets highest boost, VoIP gets moderate boost
            congestion_boost = {
                UserType.ONLINE_GAMING: 1.0 + (severity * 0.3),    # Up to 30% boost
                UserType.VOIP_MESSAGING: 1.0 + (severity * 0.2),   # Up to 20% boost
                UserType.VIDEO_STREAMING: 1.0,                      # No boost
                UserType.IOT_DEVICES: 1.0 - (severity * 0.1)       # Slight reduction
            }
            
            for user_type in UserType:
                effective_weights[user_type] *= congestion_boost[user_type]
        
        return effective_weights
