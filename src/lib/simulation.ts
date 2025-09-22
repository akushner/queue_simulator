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

  // Actions
  start: () => set({ isRunning: true }),
  stop: () => set({ isRunning: false }),
  reset: () => {
    const machines: Machine[] = [];
    for (let i = 0; i < get().numMachines; i++) {
      machines.push({ id: i, job: null, finishTime: null });
    }
    nextJobId = 0;
    set({ jobs: [], machines, time: 0, isRunning: false });
  },
  tick: () => {
    if (!get().isRunning) return;

    const now = get().time;
    const state = get();

    // Advance time
    set({ time: now + 1 });

    // Check for finished jobs
    let newMachines = state.machines.map(machine => {
      if (machine.job && machine.finishTime && now >= machine.finishTime) {
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

    set({ jobs: newJobs, machines: newMachines });
  },
}));