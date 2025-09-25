import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useSimulationStore } from '@/lib/simulation';

export function QueueMeter() {
  const jobs = useSimulationStore((state) => state.jobs);
  const maxQueueDisplaySize = useSimulationStore((state) => state.maxQueueDisplaySize);

  const jobsInQueue = jobs.length;
  const oldestJobId = jobsInQueue > 0 ? jobs[0].id : null;
  const newestJobId = jobsInQueue > 0 ? jobs[jobsInQueue - 1].id : null;

  // Calculate height percentage for the meter bar
  const meterHeightPercentage = Math.min(jobsInQueue / maxQueueDisplaySize, 1) * 100;

  // Generate dynamic axis labels
  const axisLabels = [];
  for (let i = 0; i <= 100; i += 25) {
    axisLabels.push(Math.round(maxQueueDisplaySize * (i / 100)));
  }

  return (
    <Paper elevation={3} sx={{
      p: 2,
      height: 600, // Fixed height for the meter
      display: 'flex',
      flexDirection: 'column-reverse', // To make the meter fill from bottom up
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative',
      width: 80,
      mr: 4, // Margin right to separate from other content
    }}>
      <Typography variant="caption" sx={{ position: 'absolute', top: 8, left: 8 }}>Queue Size</Typography>
      <Box sx={{
        width: '80%',
        height: `${meterHeightPercentage}%`,
        bgcolor: 'primary.main',
        borderRadius: 1,
        transition: 'height 0.2s ease-out',
        position: 'relative', // Needed for positioning children
      }} >
        {jobsInQueue > 0 && (
          <>
            <Typography variant="caption" sx={{ position: 'absolute', top: 2, width: '100%', textAlign: 'center', color: 'white' }}>
              {newestJobId}
            </Typography>
            <Typography variant="caption" sx={{ position: 'absolute', bottom: 2, width: '100%', textAlign: 'center', color: 'white' }}>
              {oldestJobId}
            </Typography>
          </>
        )}
      </Box>
      {/* Vertical Axis Labels */}
      {axisLabels.map((value) => (
        <Typography
          key={value}
          variant="caption"
          sx={{
            position: 'absolute',
            left: -20,
            bottom: `${(value / maxQueueDisplaySize) * 100}%`,
            transform: 'translateY(50%)',
          }}
        >
          {value}
        </Typography>
      ))}
    </Paper>
  );
}
