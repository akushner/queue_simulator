import random
import math
from typing import List
from .models import Job, Machine, SimulationConfig

class SimulationEngine:
    def __init__(self, config: SimulationConfig):
        self.config = config
        self.time = 0
        self.is_running = False
        self.jobs_in_queue: List[Job] = []
        self.machines: List[Machine] = [Machine(id=i) for i in range(config.num_machines)]
        self.completed_jobs_count = 0
        self.next_job_id = 10000

        # History for graphs
        self.utilization_history: List[float] = []
        self.queue_size_history: List[int] = []
        self.needed_machines_history: List[int] = []

        # Metrics
        self.total_queue_time = 0
        self.total_service_time = 0

    def reset(self):
        self.time = 0
        self.is_running = False
        self.jobs_in_queue = []
        self.machines = [Machine(id=i) for i in range(self.config.num_machines)]
        self.completed_jobs_count = 0
        self.next_job_id = 10000
        self.utilization_history = []
        self.queue_size_history = []
        self.needed_machines_history = []
        self.total_queue_time = 0
        self.total_service_time = 0

    def tick(self):
        if not self.is_running:
            return

        self.time += 1

        # 1. Process finished jobs
        for machine in self.machines:
            if machine.job and machine.finish_time and machine.finish_time <= self.time:
                # Job finished
                self.completed_jobs_count += 1
                self.total_queue_time += (machine.job.started_processing_time - machine.job.start_time)
                self.total_service_time += machine.job.processing_time
                machine.job = None
                machine.finish_time = None

        # 2. Decommission machines (not implemented in this version as per spec)

        # 3. Assign new jobs
        for machine in self.machines:
            if not machine.job and self.jobs_in_queue:
                job_to_assign = self.jobs_in_queue.pop(0)
                job_to_assign.started_processing_time = self.time
                machine.job = job_to_assign
                machine.finish_time = self.time + job_to_assign.processing_time

        # 4. Generate new jobs
        if random.random() < self.config.job_arrival_rate / 60:
            new_job = Job(
                id=self.next_job_id,
                start_time=self.time,
                processing_time=int(random.uniform(self.config.avg_job_time / 2, self.config.avg_job_time * 1.5))
            )
            self.jobs_in_queue.append(new_job)
            self.next_job_id += 1

        # 5. Update historical data
        running_jobs = sum(1 for m in self.machines if m.job)
        utilization = (running_jobs / len(self.machines)) * 100 if self.machines else 0
        self.utilization_history.append(utilization)
        self.queue_size_history.append(len(self.jobs_in_queue))

        total_remaining_processing_time = sum(j.processing_time for j in self.jobs_in_queue)
        for m in self.machines:
            if m.job and m.finish_time:
                total_remaining_processing_time += (m.finish_time - self.time)
        
        estimated_time = total_remaining_processing_time / len(self.machines) if self.machines else 0
        needed_machines = math.ceil(total_remaining_processing_time / 60) - len(self.machines) if estimated_time > 60 else 0
        self.needed_machines_history.append(max(0, needed_machines))

    def update_config(self, new_config: SimulationConfig):
        # Adjust number of machines
        if new_config.num_machines > len(self.machines):
            for i in range(len(self.machines), new_config.num_machines):
                self.machines.append(Machine(id=i))
        elif new_config.num_machines < len(self.machines):
            # Mark machines for removal (simplified: just remove idle ones)
            num_to_remove = len(self.machines) - new_config.num_machines
            idle_machines = [m for m in self.machines if not m.job]
            for i in range(min(num_to_remove, len(idle_machines))):
                self.machines.remove(idle_machines[i])

        self.config = new_config
