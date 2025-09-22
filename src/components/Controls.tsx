import { useSimulationStore } from "@/lib/simulation"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

export function Controls() {
  const {
    jobArrivalRate,
    setJobArrivalRate,
    avgJobTime,
    setAvgJobTime,
    numMachines,
    setNumMachines,
    start,
    stop,
    reset,
    isRunning,
  } = useSimulationStore()

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Controls</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Job Arrival Rate (jobs/sec)</label>
          <div className="flex items-center space-x-4">
            <Slider
              min={1}
              max={100}
              step={1}
              value={[jobArrivalRate]}
              onValueChange={(value) => setJobArrivalRate(value[0])}
            />
            <span className="font-bold w-12 text-center">{jobArrivalRate}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Average Job Time (sec)</label>
          <div className="flex items-center space-x-4">
            <Slider
              min={1}
              max={100}
              step={1}
              value={[avgJobTime]}
              onValueChange={(value) => setAvgJobTime(value[0])}
            />
            <span className="font-bold w-12 text-center">{avgJobTime}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Number of Machines</label>
          <div className="flex items-center space-x-4">
            <Slider
              min={1}
              max={50}
              step={1}
              value={[numMachines]}
              onValueChange={(value) => setNumMachines(value[0])}
            />
            <span className="font-bold w-12 text-center">{numMachines}</span>
          </div>
        </div>
        <div className="flex space-x-4">
          <Button onClick={start} disabled={isRunning}>Start</Button>
          <Button onClick={stop} disabled={!isRunning}>Stop</Button>
          <Button onClick={reset} variant="destructive">Reset</Button>
        </div>
      </div>
    </div>
  )
}
