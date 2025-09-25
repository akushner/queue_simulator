import { create } from 'zustand';
import { Job, Machine } from './types';

interface SimulationState {
  // Parameters
  jobArrivalRate: number;
  setJobArrivalRate: (rate: number) => void;
  avgJobTime: number;
  setAvgJobTime: (time: number) => void;
  numMachines: number;
  setNumMachines: (num: number) => void;
  timeScale: number;
  setTimeScale: (scale: number) => void;

  // State
  jobs: Job[];
  machines: Machine[];
  time: number;
  isRunning: boolean;
  completedJobs: Job[];
  totalQueueTime: number;
  totalServiceTime: number;
  maxQueueDisplaySize: number;
  queueSizeHistory: number[];
  utilizationHistory: number[];
  totalJobsCompleted: number;

  // Derived State (Getters)
  runningJobs: number;
  avgServiceTime: () => number;
  avgQueueTime: () => number;
  estimatedQueueEmptyTime: number;

  // Actions
  start: () => void;
  stop: () => void;
  reset: () => void;
  tick: () => void;
  updateMaxQueueDisplaySize: () => void;
}

let nextJobId = 10000;
const INITIAL_MAX_QUEUE_DISPLAY_SIZE = 50;
const QUEUE_HISTORY_LENGTH = 10;

// --- Helper Functions for Simulation Logic ---

/**
 * Processes completed jobs on machines, updating their state and collecting metrics.
 * This is crucial for ensuring that machines become available for new work and that
 * simulation statistics accurately reflect the work that has been done.
 */
const updateFinishedJobs = (machines: Machine[], time: number) => {
  let totalServiceTimeUpdate = 0;
  let totalQueueTimeUpdate = 0;
  const completedJobs: Job[] = [];

  const updatedMachines = machines.map(machine => {
    if (machine.job && machine.finishTime && time >= machine.finishTime) {
      const finishedJob = machine.job;
      const serviceTime = finishedJob.processingTime;
      const queueTime = (finishedJob.startedProcessingTime !== null) ? (finishedJob.startedProcessingTime - finishedJob.startTime) : 0;

      completedJobs.push(finishedJob);
      totalServiceTimeUpdate += serviceTime;
      totalQueueTimeUpdate += queueTime;

      return { ...machine, job: null, finishTime: null }; // Machine is now idle
    }
    return machine;
  });

  return { updatedMachines, completedJobs, totalServiceTimeUpdate, totalQueueTimeUpdate };
};

/**
 * Assigns jobs from the queue to any available and active machines.
 * This function models the core behavior of a queuing system, where work is
 * distributed to available resources.
 */
const assignJobsToMachines = (machines: Machine[], jobs: Job[], time: number) => {
  const availableMachines = machines.filter(m => m.status === 'active' && !m.job);
  const jobsToAssign = [...jobs];
  const updatedMachines = [...machines];

  for (const machine of availableMachines) {
    if (jobsToAssign.length > 0) {
      const job = jobsToAssign.shift()!;
      const jobWithStartTime = { ...job, startedProcessingTime: time };
      const machineIndex = updatedMachines.findIndex(m => m.id === machine.id);
      if (machineIndex !== -1) {
        updatedMachines[machineIndex] = {
          ...machine,
          job: jobWithStartTime,
          finishTime: time + Math.ceil(job.processingTime),
        };
      }
    }
  }

  return { updatedMachines, remainingJobs: jobsToAssign };
};

/**
 * Potentially adds a new job to the queue based on the arrival rate.
 * This simulates the inflow of work into the system, which is essential for
 * modeling real-world load.
 */
const addNewJobs = (jobs: Job[], time: number, jobArrivalRate: number, avgJobTime: number) => {
  const newJobs = [...jobs];
  if (Math.random() < jobArrivalRate / 60) {
    newJobs.push({
      id: nextJobId++,
      startTime: time,
      processingTime: Math.random() * avgJobTime * 2,
      startedProcessingTime: null,
    });
  }
  return newJobs;
};

/**
 * Removes machines that were marked for removal and are now idle.
 * This is important for dynamically scaling down the number of resources
 * without interrupting ongoing work.
 */
const removeIdleMachines = (machines: Machine[]) => {
  return machines.filter(machine => !(machine.status === 'removing' && machine.job === null));
};


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
  timeScale: 1,
  setTimeScale: (scale) => set({ timeScale: scale }),

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
  utilizationHistory: [],

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
      utilizationHistory: [],
    });
  },
  tick: () => {
    if (!get().isRunning) return;

    const state = get();
    const newNow = state.time + 1;

    // --- Simulation Steps ---

    // 1. Update finished jobs
    const { updatedMachines: machinesAfterCompletion, completedJobs, totalServiceTimeUpdate, totalQueueTimeUpdate } = updateFinishedJobs(state.machines, newNow);

    // 2. Remove idle machines marked for removal
    const machinesAfterRemoval = removeIdleMachines(machinesAfterCompletion);

    // 3. Assign jobs to available machines
    const { updatedMachines: machinesAfterAssignment, remainingJobs } = assignJobsToMachines(machinesAfterRemoval, state.jobs, newNow);

    // 4. Add new jobs to the queue
    const newJobs = addNewJobs(remainingJobs, newNow, state.jobArrivalRate, state.avgJobTime);

    const utilization = state.numMachines > 0 ? (machinesAfterAssignment.filter(m => m.job).length / state.numMachines) * 100 : 0;

    // --- Update State ---
    set(prevState => ({
      time: newNow,
      machines: machinesAfterAssignment,
      jobs: newJobs,
      completedJobs: [...prevState.completedJobs, ...completedJobs],
      totalJobsCompleted: prevState.totalJobsCompleted + completedJobs.length,
      totalServiceTime: prevState.totalServiceTime + totalServiceTimeUpdate,
      totalQueueTime: prevState.totalQueueTime + totalQueueTimeUpdate,
      queueSizeHistory: [...prevState.queueSizeHistory.slice(-(QUEUE_HISTORY_LENGTH - 1)), newJobs.length],
      utilizationHistory: [...prevState.utilizationHistory, utilization],
    }));

    get().updateMaxQueueDisplaySize();
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
}));