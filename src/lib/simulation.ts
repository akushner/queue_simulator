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
  
  // Derived State (Getters)
  runningJobs: number
  avgServiceTime: number
  avgQueueTime: number

  // Actions
  start: () => void
  stop: () => void
  reset: () => void
  tick: () => void
}

let nextJobId = 0;

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

  // Actions
  start: () => set({ isRunning: true }),
  stop: () => set({ isRunning: false }),
  reset: () => {
    const machines: Machine[] = [];
    for (let i = 0; i < get().numMachines; i++) {
      machines.push({ id: i, job: null, finishTime: null });
    }
    nextJobId = 0;
    set({
      jobs: [],
      machines,
      time: 0,
      isRunning: false,
      completedJobs: [],
      totalJobsProcessed: 0,
      totalServiceTime: 0,
      totalQueueTime: 0,
    });
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
        const queueTime = (machine.finishTime - finishedJob.startTime) - serviceTime;

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
            return { ...machine, job, finishTime: now + job.processingTime };
        }
        return machine;
    });

    // Add new jobs
    if (Math.random() < state.jobArrivalRate / 60) { // Assuming 60 ticks per second
      newJobs.push({
        id: nextJobId++,
        startTime: now,
        processingTime: Math.random() * state.avgJobTime * 2, // Simple uniform distribution
      });
    }

    set({
      jobs: newJobs,
      machines: newMachines,
      completedJobs: newCompletedJobs,
      totalJobsProcessed: newTotalJobsProcessed,
      totalServiceTime: newTotalServiceTime,
      totalQueueTime: newTotalQueueTime,
    });
  },
}));