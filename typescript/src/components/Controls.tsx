import { useState } from "react";
import { useSimulationStore } from "@/lib/simulation"
import { Slider, Button, Typography, Box } from "@mui/material"

export function Controls() {
  const {
    jobArrivalRate,
    setJobArrivalRate,
    avgJobTime,
    setAvgJobTime,
    numMachines,
    setNumMachines,
    timeScale,
    setTimeScale,
    start,
    stop,
    reset,
    isRunning,
  } = useSimulationStore()

  const [sliderValue, setSliderValue] = useState(0);

  const handleTimeScaleChange = (_: Event, newValue: number | number[]) => {
    const s = newValue as number;
    setSliderValue(s);
    const newTimeScale = Math.pow(10, s / 50);
    setTimeScale(newTimeScale);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>Controls</Typography>
      <Box sx={{ mt: 3 }}>
        <Typography gutterBottom>Job Arrival Rate (jobs/sec): {jobArrivalRate}</Typography>
        <Slider
          value={jobArrivalRate}
          onChange={(_, value) => setJobArrivalRate(value as number)}
          min={1}
          max={100}
          step={1}
          valueLabelDisplay="auto"
        />
      </Box>
      <Box sx={{ mt: 3 }}>
        <Typography gutterBottom>Average Job Time (sec): {avgJobTime}</Typography>
        <Slider
          value={avgJobTime}
          onChange={(_, value) => setAvgJobTime(value as number)}
          min={1}
          max={100}
          step={1}
          valueLabelDisplay="auto"
        />
      </Box>
      <Box sx={{ mt: 3 }}>
        <Typography gutterBottom>Number of Machines: {numMachines}</Typography>
        <Slider
          value={numMachines}
          onChange={(_, value) => setNumMachines(value as number)}
          min={1}
          max={50}
          step={1}
          valueLabelDisplay="auto"
        />
      </Box>
      <Box sx={{ mt: 3 }}>
        <Typography gutterBottom>Time Scale: {timeScale.toFixed(2)}x</Typography>
        <Slider
          value={sliderValue}
          onChange={handleTimeScaleChange}
          min={-100}
          max={100}
          step={1}
          valueLabelDisplay="auto"
        />
      </Box>
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={start} disabled={isRunning}>Start</Button>
        <Button variant="outlined" onClick={stop} disabled={!isRunning}>Stop</Button>
        <Button variant="contained" color="error" onClick={reset}>Reset</Button>
      </Box>
    </Box>
  )
}