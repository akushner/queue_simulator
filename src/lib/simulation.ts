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
  totalQueueTime: number
  totalServiceTime: number
  maxQueueDisplaySize: number
  queueSizeHistory: number[]
  totalJobsCompleted: number
  
  // Derived State (Getters)
  runningJobs: number
  avgServiceTime: () => number
  avgQueueTime: () => number
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
  jobArrivalRate: 30, // Increased for better job generation
  setJobArrivalRate: (rate) => set({ jobArrivalRate: rate }),
  avgJobTime: 10,
  setAvgJobTime: (time) => set({ avgJobTime: time }),
  numMachines: 5,
  setNumMachines: (num) => {
    const currentMachines = get().machines;
    const currentNumMachines = currentMachines.length;

    if (num > currentNumMachines) {
      // Add machines
      const newMachines = [...currentMachines];
      for (let i = currentNumMachines; i < num; i++) {
        newMachines.push({ id: i, job: null, finishTime: null, status: 'active' });
      }
      set({ machines: newMachines, numMachines: num });
    } else if (num < currentNumMachines) {
      // Mark machines for removal
      const newMachines = currentMachines.map((machine, i) => {
        if (i >= num) {
          return { ...machine, status: 'removing' };
        }
        return machine;
      });
      set({ machines: newMachines, numMachines: num });
    }
  },

  // State
  jobs: [],
  machines: [],
  time: 0,
  isRunning: false,
  completedJobs: [],
  totalJobsCompleted: 0,
  totalServiceTime: 0,
  totalQueueTime: 0,
  maxQueueDisplaySize: INITIAL_MAX_QUEUE_DISPLAY_SIZE,
  queueSizeHistory: [],

  // Derived State (Getters)
  get runningJobs() {
    return get().machines.filter(machine => machine.job !== null).length;
  },
  avgServiceTime: () => {
    const { totalServiceTime, totalJobsCompleted } = get();
    return totalJobsCompleted > 0 ? totalServiceTime / totalJobsCompleted : 0;
  },
  avgQueueTime: () => {
    const { totalQueueTime, totalJobsCompleted } = get();
    return totalJobsCompleted > 0 ? totalQueueTime / totalJobsCompleted : 0;
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
      machines.push({ id: i, job: null, finishTime: null, status: 'active' });
    }
    set({
      jobs: [],
      machines,
      time: 0,
      isRunning: false,
      completedJobs: [],
      totalJobsCompleted: 0,
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

    const state = get();
    const oldNow = state.time;
    const newNow = oldNow + 1;

    let currentJobs = [...state.jobs]; // Mutable copy of jobs in queue
    let currentMachines = [...state.machines]; // Mutable copy of machines

    let newCompletedJobs = [...state.completedJobs];
    let newTotalJobsCompleted = state.totalJobsCompleted;
    let newTotalServiceTime = state.totalServiceTime;
    let newTotalQueueTime = state.totalQueueTime;

    console.log(`--- Tick ${newNow} ---`);
    console.log(`Initial currentJobs.length: ${currentJobs.length}`);
    console.log(`Initial currentMachines (jobs): ${currentMachines.map(m => m.job ? m.job.id : 'null')}`);

    // Check for finished jobs
    currentMachines = currentMachines.map(machine => {
      if (machine.job && machine.finishTime && newNow >= machine.finishTime) { // Use newNow
        const finishedJob = machine.job;
        const serviceTime = finishedJob.processingTime;
        const queueTime = (finishedJob.startedProcessingTime !== null) ? (finishedJob.startedProcessingTime - finishedJob.startTime) : 0;

        console.log(`Finished Job ${finishedJob.id}, serviceTime: ${serviceTime}, queueTime: ${queueTime}`);

        newCompletedJobs.push(finishedJob);
        newTotalJobsCompleted++;
        newTotalServiceTime += serviceTime;
        newTotalQueueTime += queueTime;

        console.log(`newTotalServiceTime: ${newTotalServiceTime}, newTotalQueueTime: ${newTotalQueueTime}`);

        return { ...machine, job: null, finishTime: null }; // Machine becomes free
      }
      return machine;
    });
    console.log(`currentMachines after completion check (jobs): ${currentMachines.map(m => m.job ? m.job.id : 'null')}`);

    // Remove machines marked for removal that are now idle
    currentMachines = currentMachines.filter(machine => !(machine.status === 'removing' && machine.job === null));

    // Assign jobs to free machines
    console.log(`currentJobs.length before assignment: ${currentJobs.length}`);
    currentMachines = currentMachines.map(machine => {
        if (machine.status === 'active' && !machine.job && currentJobs.length > 0) {
            const job = currentJobs.shift()!; // Take job from mutable queue
            const jobWithStartTime = { ...job, startedProcessingTime: newNow }; // Use newNow
            console.log(`Assigning Job ${job.id} to machine ${machine.id}.`);
            return { ...machine, job: jobWithStartTime, finishTime: newNow + Math.ceil(job.processingTime) }; // Use newNow
        }
        return machine;
    });
    console.log(`currentMachines after assignment (jobs): ${currentMachines.map(m => m.job ? m.job.id : 'null')}`);

    // Add new jobs
    if (Math.random() < state.jobArrivalRate / 60) {
      currentJobs.push({ // Add to mutable queue
        id: nextJobId++,
        startTime: newNow,
        processingTime: Math.random() * state.avgJobTime * 2,
        startedProcessingTime: null,
      });
      console.log(`New job added. currentJobs.length: ${currentJobs.length}`);
    }

    set({
      time: newNow,
      jobs: currentJobs,
      machines: currentMachines,
      completedJobs: newCompletedJobs,
      totalJobsCompleted: newTotalJobsCompleted,
      totalServiceTime: newTotalServiceTime,
      totalQueueTime: newTotalQueueTime,
      queueSizeHistory: [...state.queueSizeHistory.slice(-(QUEUE_HISTORY_LENGTH - 1)), currentJobs.length],
    });

    get().updateMaxQueueDisplaySize();
  },
}));
