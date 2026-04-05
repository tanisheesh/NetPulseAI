"""
REST API routes for AI-Based 5G Digital Twin Network Simulator.

This module implements FastAPI REST endpoints for simulation control,
configuration management, and metrics retrieval.
"""

import os
from typing import Optional
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from models import SimulationConfig, MetricsStatistics, RLLearningStats
from simulator.engine import SimulationEngine
from api.websocket import websocket_endpoint, manager
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from db.repository import SimulationRepository


# Create FastAPI app
app = FastAPI(
    title="AI-Based 5G Digital Twin Network Simulator",
    description="Real-time 5G network simulation with AI-powered resource allocation",
    version="1.0.0"
)

# Add CORS middleware for all origins (production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global simulation engine instance
simulation_engine: Optional[SimulationEngine] = None

# Global repository instance (injected from main.py)
_repository: Optional["SimulationRepository"] = None


def set_repository(repo: "SimulationRepository"):
    """
    Set repository instance for dependency injection.
    
    Args:
        repo: SimulationRepository instance to use for database operations
    """
    global _repository
    _repository = repo


@app.post("/api/simulation/start")
async def start_simulation(config: SimulationConfig) -> dict:
    """
    Start simulation with provided configuration.
    
    Args:
        config: Simulation configuration parameters.
    
    Returns:
        Success message with configuration details.
    
    Raises:
        HTTPException 400: If configuration validation fails.
        HTTPException 409: If simulation is already running.
    """
    global simulation_engine
    
    # Check if simulation is already running
    if simulation_engine and simulation_engine.is_running:
        raise HTTPException(
            status_code=409,
            detail="Simulation is already running. Stop it before starting a new one."
        )
    
    try:
        # Load Groq API key from environment
        groq_api_key = os.getenv("GROQ_API_KEY")
        
        # Create new simulation engine with repository
        simulation_engine = SimulationEngine(
            config, 
            groq_api_key=groq_api_key,
            repository=_repository
        )
        
        # Set up WebSocket broadcast callback
        simulation_engine.set_state_callback(manager.broadcast)
        
        # Start simulation
        await simulation_engine.start()
        
        return {
            "status": "started",
            "message": "Simulation started successfully",
            "config": config.model_dump(),
            "groq_enabled": groq_api_key is not None
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start simulation: {str(e)}"
        )


@app.post("/api/simulation/stop")
async def stop_simulation() -> dict:
    """
    Stop running simulation.
    
    Returns:
        Success message.
    
    Raises:
        HTTPException 409: If simulation is not running.
    """
    global simulation_engine
    
    if not simulation_engine or not simulation_engine.is_running:
        raise HTTPException(
            status_code=409,
            detail="Simulation is not running"
        )
    
    try:
        await simulation_engine.stop()
        
        return {
            "status": "stopped",
            "message": "Simulation stopped successfully"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to stop simulation: {str(e)}"
        )


@app.post("/api/simulation/reset")
async def reset_simulation() -> dict:
    """
    Reset simulation to initial state.
    
    Stops the simulation if running and clears all state.
    
    Returns:
        Success message.
    """
    global simulation_engine
    
    if not simulation_engine:
        return {
            "status": "reset",
            "message": "No simulation to reset"
        }
    
    try:
        await simulation_engine.reset()
        
        return {
            "status": "reset",
            "message": "Simulation reset successfully"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reset simulation: {str(e)}"
        )


@app.get("/api/simulation/config")
async def get_config() -> SimulationConfig:
    """
    Retrieve current simulation configuration.
    
    Returns:
        Current simulation configuration.
    
    Raises:
        HTTPException 404: If no simulation has been created.
    """
    global simulation_engine
    
    if not simulation_engine:
        raise HTTPException(
            status_code=404,
            detail="No simulation configuration available. Start a simulation first."
        )
    
    return simulation_engine.config


@app.get("/api/simulation/metrics")
async def get_metrics() -> MetricsStatistics:
    """
    Retrieve aggregated historical metrics.
    
    Returns:
        Metrics statistics for both allocators.
    
    Raises:
        HTTPException 404: If no simulation has been created.
        HTTPException 409: If simulation hasn't collected any metrics yet.
    """
    global simulation_engine
    
    if not simulation_engine:
        raise HTTPException(
            status_code=404,
            detail="No simulation available. Start a simulation first."
        )
    
    try:
        stats = simulation_engine.metrics_collector.get_statistics()
        
        if stats.window_size == 0:
            raise HTTPException(
                status_code=409,
                detail="No metrics available yet. Wait for simulation to run."
            )
        
        return stats
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve metrics: {str(e)}"
        )


@app.get("/api/simulation/status")
async def get_status() -> dict:
    """
    Get current simulation status.
    
    Returns:
        Status information including running state, tick count, connection count,
        database connection status, and current run ID.
    """
    global simulation_engine
    
    if not simulation_engine:
        return {
            "running": False,
            "tick": 0,
            "connections": manager.get_connection_count(),
            "database_connected": _repository is not None and _repository.client.is_connected,
            "current_run_id": None,
            "message": "No simulation created"
        }
    
    # Check database connection
    db_connected = (
        simulation_engine.repository is not None and 
        simulation_engine.repository.client.is_connected
    )
    
    return {
        "running": simulation_engine.is_running,
        "tick": simulation_engine.current_tick,
        "connections": manager.get_connection_count(),
        "groq_enabled": simulation_engine.groq_layer.enabled,
        "database_connected": db_connected,
        "current_run_id": simulation_engine.current_run_id
    }


@app.get("/api/simulation/rl-stats")
async def get_rl_stats() -> RLLearningStats:
    """
    Get RL allocator learning statistics.
    
    Returns:
        Learning statistics including Q-values, exploration rate, and performance.
    
    Raises:
        HTTPException 404: If no simulation has been created.
    """
    global simulation_engine
    
    if not simulation_engine:
        raise HTTPException(
            status_code=404,
            detail="No simulation available. Start a simulation first."
        )
    
    try:
        stats_dict = simulation_engine.rl_allocator.get_learning_stats()
        return RLLearningStats(**stats_dict)
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve RL stats: {str(e)}"
        )


@app.websocket("/ws")
async def websocket_route(websocket: WebSocket):
    """
    WebSocket endpoint for real-time simulation data streaming.
    
    Args:
        websocket: WebSocket connection from client.
    """
    await websocket_endpoint(websocket)


@app.get("/api/health")
async def health_check() -> dict:
    """
    Health check endpoint for monitoring system status.
    
    Returns:
        Health status with database and simulation engine state.
    """
    global simulation_engine
    
    # Check database connection
    db_healthy = _repository is not None and _repository.client.is_connected
    
    # Check simulation engine
    engine_status = "not_initialized"
    if simulation_engine:
        engine_status = "running" if simulation_engine.is_running else "stopped"
    
    # Overall health
    healthy = db_healthy
    
    return {
        "status": "healthy" if healthy else "degraded",
        "database": "connected" if db_healthy else "disconnected",
        "simulation_engine": engine_status,
        "websocket_connections": manager.get_connection_count(),
        "timestamp": __import__("time").time()
    }


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "AI-Based 5G Digital Twin Network Simulator API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/api/health",
        "endpoints": {
            "POST /api/simulation/start": "Start simulation with configuration",
            "POST /api/simulation/stop": "Stop running simulation",
            "POST /api/simulation/reset": "Reset simulation state",
            "GET /api/simulation/config": "Get current configuration",
            "GET /api/simulation/metrics": "Get aggregated metrics",
            "GET /api/simulation/status": "Get simulation status",
            "GET /api/health": "Health check endpoint",
            "WS /ws": "WebSocket for real-time data streaming",
            "GET /api/history": "List recent simulation runs",
            "GET /api/history/{run_id}": "Get single run with decisions",
            "DELETE /api/history/{run_id}": "Delete simulation run",
            "GET /api/history/{run_id}/export": "Export run data (CSV/JSON)",
            "WS /api/history/{run_id}/replay": "Replay simulation via WebSocket"
        }
    }


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    global simulation_engine
    
    if simulation_engine:
        await simulation_engine.close()
