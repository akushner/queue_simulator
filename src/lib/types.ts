export interface Job {
  id: number;
  startTime: number;
  processingTime: number;
}

export interface Machine {
  id: number;
  job: Job | null;
  finishTime: number | null;
}
