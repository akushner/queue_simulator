from pydantic import BaseModel
from typing import Optional, List

class Job(BaseModel):
    id: int
    start_time: int
    processing_time: int
    started_processing_time: Optional[int] = None

class Machine(BaseModel):
    id: int
    job: Optional[Job] = None
    finish_time: Optional[int] = None
    status: str = 'active' # 'active' or 'removing'

class SimulationState(BaseModel):
    time: int
    is_running: bool
    jobs_in_queue: List[Job]
    machines: List[Machine]
    completed_jobs_count: int
    utilization_history: List[float]
    queue_size_history: List[int]
    needed_machines_history: List[int]

class SimulationConfig(BaseModel):
    job_arrival_rate: float
    avg_job_time: int
    num_machines: int
