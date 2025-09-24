import { useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import { useSimulationStore } from "@/lib/simulation"
import { Job, Machine } from "@/lib/types"

function JobCube({ job, position, scale = 1 }: { job: Job, position?: [number, number, number], scale?: number }) {
  return (
    <mesh position={position} scale={[scale, scale, scale]}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color="lightblue" />
      <Text
        position={[0, 0, 0.4]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {job.id}
      </Text>
    </mesh>
  )
}

function MachineLane({ machine, index, numLanes }: { machine: Machine, index: number, numLanes: number }) {
  const { time } = useSimulationStore();
  const availableHeight = 10;
  const laneSpacing = availableHeight / numLanes;
  const scale = Math.min(1, laneSpacing);
  const totalHeight = numLanes * laneSpacing;
  const laneY = index * laneSpacing - totalHeight / 2 + laneSpacing / 2;

  let jobPosition: [number, number, number] = [-4, laneY, 0]; // Default position at the start of the lane

  if (machine.job && machine.finishTime) {
    const totalProcessingTime = machine.job.processingTime;
    const remainingTime = machine.finishTime - time;
    const progress = 1 - (remainingTime / totalProcessingTime);
    jobPosition = [-4 + (progress * 8), laneY, 0]; // Move job along the lane (length 8 units)
  }

  return (
    <group>
      {/* Machine Base */}
      <mesh position={[-4.5, laneY, -0.1]} scale={[scale, scale, scale]}>
        <boxGeometry args={[0.5, 1, 0.2]} />
        <meshStandardMaterial color="darkgrey" />
      </mesh>
      {/* Lane Line */}
      <mesh position={[0, laneY, -0.1]}>
        <boxGeometry args={[9, 0.1, 0.05]} />
        <meshStandardMaterial color="lightgrey" />
      </mesh>
      {machine.job && <JobCube job={machine.job} position={jobPosition} scale={scale} />}
    </group>
  );
}

function QueueDisplay() {
  const jobs = useSimulationStore((state) => state.jobs);
  const estimatedQueueEmptyTime = useSimulationStore((state) => state.estimatedQueueEmptyTime);

  return (
    <group position={[-8, 0, 0]}> {/* Position the queue to the left */}
      <Text
        position={[0, jobs.length * 0.7 / 2 + 1, 0]} // Position above the jobs
        fontSize={0.4}
        color="black"
        anchorX="center"
        anchorY="bottom"
      >
        Jobs in Queue: {jobs.length}
      </Text>
      <Text
        position={[0, jobs.length * 0.7 / 2 + 0.5, 0]} // Position above the jobs
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="bottom"
      >
        Est. Empty Time: {estimatedQueueEmptyTime.toFixed(1)}s
      </Text>
      {jobs.map((job, i) => (
        <JobCube key={job.id} job={job} position={[0, -i * 0.7, 0]} scale={1} />
      ))}
    </group>
  );
}

function Scene() {
  const tick = useSimulationStore((state) => state.tick);
  const machines = useSimulationStore((state) => state.machines);

  useFrame(() => {
    tick();
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <QueueDisplay />
      {machines.map((machine, index) => (
        <MachineLane key={machine.id} machine={machine} index={index} numLanes={machines.length} />
      ))}
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