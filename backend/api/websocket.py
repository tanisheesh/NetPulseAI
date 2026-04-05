"""
WebSocket server for AI-Based 5G Digital Twin Network Simulator.

This module implements real-time data streaming to connected clients via WebSocket,
broadcasting network state updates within 50ms of each simulation tick.
"""

import json
from typing import List
from fastapi import WebSocket, WebSocketDisconnect

from models import NetworkState


class ConnectionManager:
    """
    Manages WebSocket connections and broadcasts network state.
    
    Supports up to 10 concurrent client connections and continues simulation
    even when clients disconnect. Serializes NetworkState as JSON and broadcasts
    within 50ms of tick completion.
    
    Features:
    - Connection lifecycle management (connect/disconnect)
    - Broadcast to all active connections
    - Automatic cleanup of failed connections
    - JSON serialization of network state
    """
    
    def __init__(self, max_connections: int = 10):
        """
        Initialize connection manager.
        
        Args:
            max_connections: Maximum number of concurrent client connections.
        """
        self.active_connections: List[WebSocket] = []
        self.max_connections = max_connections
    
    async def connect(self, websocket: WebSocket) -> bool:
        """
        Accept a new WebSocket connection.
        
        Args:
            websocket: WebSocket connection to accept.
        
        Returns:
            True if connection accepted, False if max connections reached.
        """
        if len(self.active_connections) >= self.max_connections:
            await websocket.close(code=1008, reason="Maximum connections reached")
            return False
        
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected. Total connections: {len(self.active_connections)}")
        return True
    
    def disconnect(self, websocket: WebSocket) -> None:
        """
        Remove a WebSocket connection.
        
        Args:
            websocket: WebSocket connection to remove.
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"Client disconnected. Total connections: {len(self.active_connections)}")
    
    async def broadcast(self, network_state: NetworkState) -> None:
        """
        Broadcast network state to all connected clients.
        
        Serializes NetworkState as JSON and sends to all active connections.
        Automatically removes failed connections during broadcast.
        
        Args:
            network_state: Network state snapshot to broadcast.
        """
        if not self.active_connections:
            return
        
        # Serialize network state to JSON
        try:
            message = network_state.model_dump_json()
        except Exception as e:
            print(f"Error serializing network state: {e}")
            return
        
        # Broadcast to all connections
        failed_connections = []
        
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error broadcasting to client: {e}")
                failed_connections.append(connection)
        
        # Remove failed connections
        for connection in failed_connections:
            self.disconnect(connection)
    
    def get_connection_count(self) -> int:
        """
        Get the number of active connections.
        
        Returns:
            Number of active WebSocket connections.
        """
        return len(self.active_connections)


# Global connection manager instance
manager = ConnectionManager()


async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time simulation data streaming.
    
    Accepts client connections and keeps them alive to receive network state
    broadcasts. Handles disconnections gracefully.
    
    Args:
        websocket: WebSocket connection from client.
    """
    # Accept connection
    connected = await manager.connect(websocket)
    
    if not connected:
        return
    
    try:
        # Keep connection alive and listen for client messages
        # (In this implementation, we only broadcast from server to client)
        while True:
            # Wait for any message from client (ping/pong to keep alive)
            data = await websocket.receive_text()
            
            # Echo back for connection health check
            if data == "ping":
                await websocket.send_text("pong")
    
    except WebSocketDisconnect:
        # Client disconnected normally
        manager.disconnect(websocket)
    
    except Exception as e:
        # Unexpected error
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)
