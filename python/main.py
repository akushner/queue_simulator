import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .models import SimulationState, SimulationConfig
from .simulation import SimulationEngine

app = FastAPI()

# --- Simulation Setup ---
initial_config = SimulationConfig(job_arrival_rate=30, avg_job_time=10, num_machines=5)
simulation = SimulationEngine(config=initial_config)

# --- WebSocket Communication ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_state(self, state: SimulationState):
        for connection in self.active_connections:
            await connection.send_json(state.dict())

manager = ConnectionManager()

async def simulation_loop():
    """Runs the simulation in the background and broadcasts the state."""
    while True:
        simulation.tick()
        state = SimulationState(
            time=simulation.time,
            is_running=simulation.is_running,
            jobs_in_queue=simulation.jobs_in_queue,
            machines=simulation.machines,
            completed_jobs_count=simulation.completed_jobs_count,
            utilization_history=simulation.utilization_history,
            queue_size_history=simulation.queue_size_history,
            needed_machines_history=simulation.needed_machines_history,
        )
        await manager.broadcast_state(state)
        await asyncio.sleep(0.1) # Controls the speed of the simulation ticks

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # The backend only sends data, so we just wait here
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- API Endpoints for Control ---

@app.post("/start")
async def start_simulation():
    simulation.is_running = True
    return {"message": "Simulation started"}

@app.post("/stop")
async def stop_simulation():
    simulation.is_running = False
    return {"message": "Simulation stopped"}

@app.post("/reset")
async def reset_simulation():
    simulation.reset()
    return {"message": "Simulation reset"}

@app.post("/config")
async def update_config(config: SimulationConfig):
    simulation.update_config(config)
    return {"message": "Configuration updated"}

# --- Serve Frontend ---
# This part assumes you will build the TypeScript frontend and place the output in a 'static' directory
# You might need to adjust the path depending on your final project structure.

static_files_path = Path(__file__).parent.parent / "typescript" / "dist"
if static_files_path.exists():
    app.mount("/", StaticFiles(directory=static_files_path, html=True), name="static")
