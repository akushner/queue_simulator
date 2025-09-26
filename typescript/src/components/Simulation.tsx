import { useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import { useSimulationStore } from "@/lib/simulation"
import { Job, Machine } from "@/lib/types"

// --- Individual Components -------------------------------------------

function JobCube({ job, position, scale = 1 }: { job: Job, position?: [number, number, number], scale?: number }) {
  return (
    <mesh position={position} scale={[scale, scale, scale]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="lightblue" />
      <Text
        position={[0, 0, 0.4]}
        fontSize={0.2}
        color="red"
        anchorX="center"
        anchorY="middle"
      >
        {job.id}
      </Text>
    </mesh>
  )
}

function QueueDisplay() {
  const jobs = useSimulationStore((state) => state.jobs);
  const machines = useSimulationStore((state) => state.machines);
  const time = useSimulationStore((state) => state.time);
  const numMachines = useSimulationStore((state) => state.numMachines);

  const estimatedQueueEmptyTime = (() => {
    let totalRemainingProcessingTime = 0;
    jobs.forEach(job => { totalRemainingProcessingTime += job.processingTime; });
    machines.forEach(machine => {
      if (machine.job && machine.finishTime) {
        totalRemainingProcessingTime += (machine.finishTime - time);
      }
    });
    return numMachines > 0 ? totalRemainingProcessingTime / numMachines : 0;
  })();

  return (
    <group position={[-8, 0, 0]}> {/* Position the queue to the left */}
      <Text position={[0, jobs.length * 0.7 / 2 + 2, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="bottom">
        Jobs in Queue: {jobs.length}
      </Text>
      <Text position={[0, jobs.length * 0.7 / 2 + 1.5, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="bottom">
        Est. Empty Time: {estimatedQueueEmptyTime.toFixed(1)}s
      </Text>
      {jobs.map((job, i) => (
        <JobCube key={job.id} job={job} position={[0, -i * 0.7, 0]} scale={1} />
      ))}
    </group>
  );
}

// --- Lanes Visualization -------------------------------------------

function MachineLane({ machine, index, numLanes }: { machine: Machine, index: number, numLanes: number }) {
  const { time } = useSimulationStore();
  const availableHeight = 10;
  const laneSpacing = availableHeight / numLanes;
  const scale = Math.min(1, laneSpacing);
  const totalHeight = numLanes * laneSpacing;
  const laneY = index * laneSpacing - totalHeight / 2 + laneSpacing / 2;

  let jobPosition: [number, number, number] = [-4, laneY, 0];

  if (machine.job && machine.finishTime) {
    const totalProcessingTime = machine.job.processingTime;
    const remainingTime = machine.finishTime - time;
    const progress = 1 - (remainingTime / totalProcessingTime);
    jobPosition = [-4 + (progress * 8), laneY, 0];
  }

  return (
    <group>
      <mesh position={[-4.5, laneY, -0.1]} scale={[scale, scale, scale]}>
        <boxGeometry args={[0.5, 1, 0.2]} />
        <meshStandardMaterial color="darkgrey" />
      </mesh>
      <mesh position={[0, laneY, -0.1]}>
        <boxGeometry args={[9, 0.1, 0.05]} />
        <meshStandardMaterial color="lightgrey" />
      </mesh>
      {machine.job && <JobCube job={machine.job} position={jobPosition} scale={scale} />}
    </group>
  );
}

function LanesView({ machines }: { machines: Machine[] }) {
  return (
    <>
      {machines.map((machine, index) => (
        <MachineLane key={machine.id} machine={machine} index={index} numLanes={machines.length} />
      ))}
    </>
  );
}

// --- Grid Visualization ---------------------------------------------

function MachineBox({ machine, position }: { machine: Machine, position: [number, number, number] }) {
  const colorMap = {
    running: '#006400',    // darkgreen
    available: '#90EE90',  // lightgreen
    removing: '#800080',   // purple
    problem: '#FF0000',     // red
  };

  let color = '#FFFFFF'; // white
  if (machine.job) {
    color = colorMap.running;
  } else if (machine.status === 'active') {
    color = colorMap.available;
  } else if (machine.status === 'removing') {
    color = colorMap.removing;
  }

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="red" />
      </mesh>
      {machine.job && (
        <Text position={[0, 0, 0.1]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
          {machine.job.id}
        </Text>
      )}
    </group>
  );
}

function GridView({ machines }: { machines: Machine[] }) {
  const numMachines = machines.length;
  const cols = Math.ceil(Math.sqrt(numMachines));
  const rows = Math.ceil(numMachines / cols);
  const boxSize = 1.2;

  return (
    <group position={[0, 0, 0]}>
      {machines.map((machine, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = (col - (cols - 1) / 2) * boxSize;
        const y = (row - (rows - 1) / 2) * -boxSize; // Negative to build from top down
        return <MachineBox key={machine.id} machine={machine} position={[x, y, 0]} />;
      })}
    </group>
  );
}

// --- Visualization Router -----------------------------------------

function MachineVisualization() {
  const machines = useSimulationStore((state) => state.machines);
  const mode = useSimulationStore((state) => state.visualizationMode);

  if (mode === 'lanes') {
    return <LanesView machines={machines} />;
  }
  return <GridView machines={machines} />;
}

// --- Main Scene -----------------------------------------------------

function Scene() {
  const tick = useSimulationStore((state) => state.tick);
  const timeScale = useSimulationStore((state) => state.timeScale);
  const timeAccumulator = useRef(0);

  useFrame((_, delta) => {
    timeAccumulator.current += delta * timeScale;
    while (timeAccumulator.current >= 1) {
      tick();
      timeAccumulator.current -= 1;
    }
  });

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} />
      <QueueDisplay />
      <MachineVisualization />
    </>
  );
}

export function Simulation() {
  const reset = useSimulationStore((state) => state.reset)

  useEffect(() => {
    reset()
  }, [reset])

  return (
    <Canvas>
      <Scene />
    </Canvas>
  )
}
