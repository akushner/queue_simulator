import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useSimulationStore } from '@/lib/simulation';

export function Dashboard() {
  const {
    time,
    jobs,
    runningJobs,
    avgServiceTime,
    avgQueueTime,
    totalJobsProcessed,
  } = useSimulationStore();

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Simulation Metrics</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Typography variant="body1">Time: {time.toFixed(0)}s</Typography>
        <Typography variant="body1">Jobs in Queue: {jobs.length}</Typography>
        <Typography variant="body1">Running Jobs: {runningJobs}</Typography>
        <Typography variant="body1">Total Processed: {totalJobsProcessed}</Typography>
        <Typography variant="body1">Avg Service Time: {avgServiceTime.toFixed(2)}s</Typography>
        <Typography variant="body1">Avg Queue Time: {avgQueueTime.toFixed(2)}s</Typography>
      </Box>
    </Paper>
  );
}
