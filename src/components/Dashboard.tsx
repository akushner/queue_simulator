import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useSimulationStore } from '@/lib/simulation';

export function Dashboard() {
  const time = useSimulationStore((state) => state.time);
  const jobs = useSimulationStore((state) => state.jobs);
  const runningJobs = useSimulationStore((state) => state.runningJobs);
  const avgServiceTime = useSimulationStore((state) => state.avgServiceTime());
  const avgQueueTime = useSimulationStore((state) => state.avgQueueTime());
  const totalJobsCompleted = useSimulationStore((state) => state.totalJobsCompleted);
  const machines = useSimulationStore((state) => state.machines);
  const numMachines = useSimulationStore((state) => state.numMachines);

  const estimatedQueueEmptyTime = React.useMemo(() => {
    let totalRemainingProcessingTime = 0;

    // Jobs in queue
    jobs.forEach(job => {
      totalRemainingProcessingTime += job.processingTime;
    });

    // Jobs currently on machines (remaining time)
    machines.forEach(machine => {
      if (machine.job && machine.finishTime) {
        totalRemainingProcessingTime += (machine.finishTime - time);
      }
    });

    return numMachines > 0 ? totalRemainingProcessingTime / numMachines : 0;
  }, [jobs, machines, time, numMachines]);

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Simulation Metrics</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Typography variant="body1">Time: {time.toFixed(0)}s</Typography>
        <Typography variant="body1">Jobs in Queue: {jobs.length}</Typography>
        <Typography variant="body1">Running Jobs: {runningJobs}</Typography>
        <Typography variant="body1">Total Processed: {totalJobsCompleted}</Typography>
        <Typography variant="body1">Avg Service Time: {avgServiceTime.toFixed(2)}s</Typography>
        <Typography variant="body1">Avg Queue Time: {avgQueueTime.toFixed(2)}s</Typography>
        <Typography variant="body1">Est. Time for Newest Job: {estimatedQueueEmptyTime.toFixed(2)}s</Typography>
      </Box>
    </Paper>
  );
}
