"""
RL allocator for AI-Based 5G Digital Twin Network Simulator.

This module implements a Multi-Armed Bandit allocator using epsilon-greedy strategy
that learns optimal allocation weights during simulation. No heavy ML libraries - pure numpy only.
"""

import time
import numpy as np
from typing import Dict, Optional

from models import UserType, TrafficDemand, AllocationDecision


class RLAllocator:
    """
    Multi-Armed Bandit allocator using epsilon-greedy strategy.
    
    Learns optimal allocation weights during simulation by treating
    each user type's priority weight as an "arm" to explore/exploit.
    
    State: Q-values for each user type (estimated reward per weight level)
    Action: Choose priority weights from discrete options
    Reward: QoS score improvement over baseline for that tick
    
    Characteristics:
    - Learning: Improves allocation strategy over time
    - Exploration: Tries different weight combinations (epsilon-greedy)
    - Exploitation: Uses best-known weights as learning matures
    - Fast: Completes allocation in <10ms
    """
    
    def __init__(self, epsilon: float = 0.15, learning_rate: float = 0.1):
        """
        Initialize RL allocator with epsilon-greedy parameters.
        
        Args:
            epsilon: Exploration rate (0.15 = 15% random exploration)
            learning_rate: Q-learning update rate (0.1 = 10% weight on new info)
        """
        self.epsilon = epsilon  # exploration rate (15%)
        self.learning_rate = learning_rate
        self.name = "RL Multi-Armed Bandit"
        
        # Discrete weight options per user type
        self.weight_options = [0.5, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0]
        
        # Q-values: estimated reward for each (user_type, weight_option) pair
        # Shape: 4 user types × 7 weight options
        self.q_values = {}  # initialize all to 0.0
        for user_type in UserType:
            self.q_values[user_type] = np.zeros(len(self.weight_options))
        
        # Current chosen weight index per user type
        self.current_weight_indices = {}  # start at middle option (1.0)
        for user_type in UserType:
            self.current_weight_indices[user_type] = 2  # index 2 = weight 1.0
        
        # Action counts for each (user_type, weight_option) pair
        self.action_counts = {}
        for user_type in UserType:
            self.action_counts[user_type] = np.zeros(len(self.weight_options))
        
        # Performance tracking
        self.total_reward = 0.0
        self.tick_count = 0
        self.recent_qos_history = []  # last 10 QoS scores for reward calc
        
        self.congestion_threshold = 0.8  # 80% capacity
    
    def allocate(
        self,
        total_bandwidth: float,
        demands: Dict[UserType, TrafficDemand],
        congestion_level: float = 0.0
    ) -> AllocationDecision:
        """
        Choose weights using epsilon-greedy, then allocate proportionally.
        
        Same allocation math as AIAllocator but with learned weights.
        
        Args:
            total_bandwidth: Total available bandwidth in Mbps.
            demands: Dictionary mapping UserType to TrafficDemand for current tick.
            congestion_level: Current network congestion as fraction (0.0-1.0).
        
        Returns:
            AllocationDecision with RL-optimized bandwidth allocation.
        """
        # Step 1: Select weights using epsilon-greedy
        current_weights = {}
        for user_type in UserType:
            weight_index = self._epsilon_greedy_select(user_type)
            self.current_weight_indices[user_type] = weight_index
            current_weights[user_type] = self.weight_options[weight_index]
            
            # Increment action count
            self.action_counts[user_type][weight_index] += 1
        
        # Step 2: Calculate effective weights with congestion adjustment
        effective_weights = self._calculate_effective_weights(
            current_weights,
            congestion_level
        )
        
        # Step 3: Calculate weighted demands (same logic as AIAllocator)
        weighted_demands = {}
        total_weighted_demand = 0.0
        
        for user_type, demand in demands.items():
            # Weight the bandwidth demand by priority and latency sensitivity
            weight = effective_weights[user_type]
            latency_factor = 1.0 + (demand.latency_sensitivity * 0.5)  # 1.0-1.5x boost
            weighted_demand = demand.bandwidth_demand * weight * latency_factor
            
            weighted_demands[user_type] = weighted_demand
            total_weighted_demand += weighted_demand
        
        # Step 4: Allocate bandwidth proportionally to weighted demands
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
        
        # Step 5: Ensure total doesn't exceed bandwidth cap due to rounding
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
            strategy_name=self.name,
            timestamp=time.time()
        )
    
    def update(self, baseline_qos: float, rl_qos: float) -> None:
        """
        Update Q-values based on reward received this tick.
        
        Reward = rl_qos - baseline_qos (positive = RL won)
        Use Q-learning update: Q(s,a) += lr * (reward - Q(s,a))
        
        Args:
            baseline_qos: QoS score from baseline allocator this tick
            rl_qos: QoS score from RL allocator this tick
        """
        # Calculate reward (positive when RL beats baseline)
        reward = rl_qos - baseline_qos
        
        # Update total reward and tick count
        self.total_reward += reward
        self.tick_count += 1
        
        # Track recent QoS history
        self.recent_qos_history.append(rl_qos)
        if len(self.recent_qos_history) > 10:
            self.recent_qos_history.pop(0)
        
        # Update Q-values for each user type's chosen action
        for user_type in UserType:
            action_index = self.current_weight_indices[user_type]
            
            # Q-learning update rule
            old_q = self.q_values[user_type][action_index]
            self.q_values[user_type][action_index] = old_q + self.learning_rate * (reward - old_q)
    
    def get_current_weights(self) -> Dict[UserType, float]:
        """
        Return current priority weights being used.
        
        Returns:
            Dictionary mapping UserType to current weight value.
        """
        return {
            user_type: self.weight_options[self.current_weight_indices[user_type]]
            for user_type in UserType
        }
    
    def get_exploration_rate(self) -> float:
        """
        Return current epsilon (exploration rate).
        
        Returns:
            Current exploration rate (0.0-1.0).
        """
        return self.epsilon
    
    def get_learning_stats(self) -> dict:
        """
        Return stats about learning progress.
        
        Returns:
            Dictionary with learning statistics:
            - total_ticks: how many ticks learned
            - avg_reward: average reward per tick
            - current_weights: current priority weights
            - exploration_rate: current epsilon
            - best_weights_found: highest Q-value weights per user type
        """
        # Calculate average reward
        avg_reward = self.total_reward / self.tick_count if self.tick_count > 0 else 0.0
        
        # Find best weights (highest Q-value) for each user type
        best_weights_found = {}
        for user_type in UserType:
            best_index = int(np.argmax(self.q_values[user_type]))
            best_weights_found[user_type] = self.weight_options[best_index]
        
        return {
            "total_ticks": self.tick_count,
            "avg_reward": round(avg_reward, 4),
            "current_weights": self.get_current_weights(),
            "exploration_rate": round(self.epsilon, 4),
            "best_weights_found": best_weights_found
        }
    
    def _epsilon_greedy_select(self, user_type: UserType) -> int:
        """
        With probability epsilon: random weight index (explore)
        With probability 1-epsilon: best Q-value weight index (exploit)
        
        Args:
            user_type: User type to select weight for
        
        Returns:
            Index into self.weight_options
        """
        if np.random.random() < self.epsilon:
            # Explore: random action
            return np.random.randint(0, len(self.weight_options))
        else:
            # Exploit: best known action
            return int(np.argmax(self.q_values[user_type]))
    
    def update_epsilon(self) -> None:
        """
        Decay epsilon over time: epsilon = max(0.05, epsilon * 0.995)
        
        More exploitation as learning matures.
        Called every tick.
        """
        self.epsilon = max(0.05, self.epsilon * 0.995)
    
    def _calculate_effective_weights(
        self,
        base_weights: Dict[UserType, float],
        congestion_level: float
    ) -> Dict[UserType, float]:
        """
        Calculate effective weights with congestion adjustment.
        
        When congestion exceeds 80%, apply additional boost to latency-sensitive
        traffic (gaming and VoIP) to maintain QoS during network stress.
        
        Args:
            base_weights: Base priority weights from RL selection
            congestion_level: Current network congestion as fraction (0.0-1.0).
        
        Returns:
            Dictionary mapping UserType to effective priority weights.
        """
        effective_weights = base_weights.copy()
        
        if congestion_level > self.congestion_threshold:
            # Calculate congestion severity (0.0-1.0 above threshold)
            severity = (congestion_level - self.congestion_threshold) / (1.0 - self.congestion_threshold)
            
            # Boost latency-sensitive traffic during congestion
            congestion_boost = {
                UserType.ONLINE_GAMING: 1.0 + (severity * 0.3),    # Up to 30% boost
                UserType.VOIP_MESSAGING: 1.0 + (severity * 0.2),   # Up to 20% boost
                UserType.VIDEO_STREAMING: 1.0,                      # No boost
                UserType.IOT_DEVICES: 1.0 - (severity * 0.1)       # Slight reduction
            }
            
            for user_type in UserType:
                effective_weights[user_type] *= congestion_boost[user_type]
        
        return effective_weights
