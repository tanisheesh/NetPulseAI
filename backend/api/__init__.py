"""
API package for AI-Based 5G Digital Twin Network Simulator.

This package contains the FastAPI REST endpoints and WebSocket server
for simulation control and real-time data streaming.
"""

from api.websocket import ConnectionManager, manager, websocket_endpoint
from api.routes import app

__all__ = [
    'ConnectionManager',
    'manager',
    'websocket_endpoint',
    'app',
]
