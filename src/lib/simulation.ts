import { create } from 'zustand'
import { Job, Machine } from './types'

interface SimulationState {
  // Parameters
  jobArrivalRate: number
  setJobArrivalRate: (rate: number) => void
  avgJobTime: number
  setAvgJobTime: (time: number) => void
  numMachines: number
  setNumMachines: (num: number) => void

  // State
  jobs: Job[]
  machines: Machine[]
  time: number
  isRunning: boolean
  completedJobs: Job[]
  totalJobsProcessed: number
  totalServiceTime: number
  totalQueueTime: number
  maxQueueDisplaySize: number
  queueSizeHistory: number[]
  
  // Derived State (Getters)
  runningJobs: number
  avgServiceTime: number
  avgQueueTime: number
  estimatedQueueEmptyTime: number

  // Actions
  start: () => void
  stop: () => void
  reset: () => void
  tick: () => void
  updateMaxQueueDisplaySize: () => void
}

let nextJobId = 10000;
const INITIAL_MAX_QUEUE_DISPLAY_SIZE = 50;
const QUEUE_HISTORY_LENGTH = 10;

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Parameters
  jobArrivalRate: 5,
  setJobArrivalRate: (rate) => set({ jobArrivalRate: rate }),
  avgJobTime: 10,
  setAvgJobTime: (time) => set({ avgJobTime: time }),
  numMachines: 5,
  setNumMachines: (num) => {
    set({ numMachines: num });
    get().reset();
  },

  // State
  jobs: [],
  machines: [],
  time: 0,
  isRunning: false,
  completedJobs: [],
  totalJobsProcessed: 0,
  totalServiceTime: 0,
  totalQueueTime: 0,
  maxQueueDisplaySize: INITIAL_MAX_QUEUE_DISPLAY_SIZE,
  queueSizeHistory: [],

  // Derived State (Getters)
  get runningJobs() {
    return get().machines.filter(machine => machine.job !== null).length;
  },
  get avgServiceTime() {
    const { totalServiceTime, totalJobsProcessed } = get();
    return totalJobsProcessed > 0 ? totalServiceTime / totalJobsProcessed : 0;
  },
  get avgQueueTime() {
    const { totalQueueTime, totalJobsProcessed } = get();
    return totalJobsProcessed > 0 ? totalQueueTime / totalJobsProcessed : 0;
  },
  get estimatedQueueEmptyTime() {
    const state = get();
    let totalRemainingProcessingTime = 0;

    // Jobs in queue
    state.jobs.forEach(job => {
      totalRemainingProcessingTime += job.processingTime;
    });

    // Jobs currently on machines (remaining time)
    state.machines.forEach(machine => {
      if (machine.job && machine.finishTime) {
        totalRemainingProcessingTime += (machine.finishTime - state.time);
      }
    });

    return state.numMachines > 0 ? totalRemainingProcessingTime / state.numMachines : 0;
  },

  // Actions
  start: () => set({ isRunning: true }),
  stop: () => set({ isRunning: false }),
  reset: () => {
    const machines: Machine[] = [];
    for (let i = 0; i < get().numMachines; i++) {
      machines.push({ id: i, job: null, finishTime: null });
    }
    set({
      jobs: [],
      machines,
      time: 0,
      isRunning: false,
      completedJobs: [],
      totalJobsProcessed: 0,
      totalServiceTime: 0,
      totalQueueTime: 0,
      maxQueueDisplaySize: INITIAL_MAX_QUEUE_DISPLAY_SIZE,
      queueSizeHistory: [],
    });
  },
  updateMaxQueueDisplaySize: () => {
    const state = get();
    const currentQueueSize = state.jobs.length;
    let newMaxQueueDisplaySize = state.maxQueueDisplaySize;

    // Resizing Up Logic
    const historyThreshold = Math.floor(QUEUE_HISTORY_LENGTH * 0.8); // e.g., 80% of history
    const consistentlyAboveThreshold = state.queueSizeHistory.filter(size => size > newMaxQueueDisplaySize).length >= historyThreshold;

    if (currentQueueSize > newMaxQueueDisplaySize && consistentlyAboveThreshold) {
      newMaxQueueDisplaySize *= 2;
    }

    // Resizing Down Logic
    const consistentlyBelowThreshold = state.queueSizeHistory.filter(size => size < newMaxQueueDisplaySize / 4).length >= historyThreshold; // e.g., below 25% of current max

    if (currentQueueSize < newMaxQueueDisplaySize / 2 && consistentlyBelowThreshold && newMaxQueueDisplaySize > INITIAL_MAX_QUEUE_DISPLAY_SIZE) {
      newMaxQueueDisplaySize /= 2;
    }

    if (newMaxQueueDisplaySize !== state.maxQueueDisplaySize) {
      set({ maxQueueDisplaySize: newMaxQueueDisplaySize });
    }
  },
  tick: () => {
    if (!get().isRunning) return;

    const now = get().time;
    const state = get();

    let newCompletedJobs = [...state.completedJobs];
    let newTotalJobsProcessed = state.totalJobsProcessed;
    let newTotalServiceTime = state.totalServiceTime;
    let newTotalQueueTime = state.totalQueueTime;

    // Advance time
    set({ time: now + 1 });

    // Check for finished jobs
    let newMachines = state.machines.map(machine => {
      if (machine.job && machine.finishTime && now >= machine.finishTime) {
        const finishedJob = machine.job;
        const serviceTime = finishedJob.processingTime;
        const queueTime = (finishedJob.startedProcessingTime !== null) ? (finishedJob.startedProcessingTime - finishedJob.startTime) : 0;

        newCompletedJobs.push(finishedJob);
        newTotalJobsProcessed++;
        newTotalServiceTime += serviceTime;
        newTotalQueueTime += queueTime;

        return { ...machine, job: null, finishTime: null };
      }
      return machine;
    });

    // Assign jobs to free machines
    let newJobs = [...state.jobs];
    newMachines = newMachines.map(machine => {
        if (!machine.job && newJobs.length > 0) {
            const job = newJobs.shift()!;
            const jobWithStartTime = { ...job, startedProcessingTime: now };
            return { ...machine, job: jobWithStartTime, finishTime: now + job.processingTime };
        }
        return machine;
    });

    // Add new jobs
    if (Math.random() < state.jobArrivalRate / 60) { // Assuming 60 ticks per second
      newJobs.push({
        id: nextJobId++,
        startTime: now,
        processingTime: Math.random() * state.avgJobTime * 2, // Simple uniform distribution
        startedProcessingTime: null,
      });
    }

    set({
      jobs: newJobs,
      machines: newMachines,
      completedJobs: newCompletedJobs,
      totalJobsProcessed: newTotalJobsProcessed,
      totalServiceTime: newTotalServiceTime,
      totalQueueTime: newTotalQueueTime,
      queueSizeHistory: [...state.queueSizeHistory.slice(-(QUEUE_HISTORY_LENGTH - 1)), newJobs.length],
    });

    get().updateMaxQueueDisplaySize();
  },
}));