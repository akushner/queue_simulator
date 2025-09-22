import { useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useSimulationStore } from "@/lib/simulation"
import { Job, Machine } from "@/lib/types"

function JobCube({ job }: { job: Job }) {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="lightblue" />
    </mesh>
  )
}

function MachineCube({ machine }: { machine: Machine }) {
  return (
    <group position={[machine.id * 2 - 5, 0, 5]}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={machine.job ? "orange" : "lightgray"} />
      </mesh>
      {machine.job && <JobCube job={machine.job} />}
    </group>
  )
}

function Queue() {
  const jobs = useSimulationStore((state) => state.jobs)
  return (
    <group position={[-5, 0, 0]}>
      {jobs.map((job, i) => (
        <group key={job.id} position={[0, 0, -i * 0.7]}>
          <JobCube job={job} />
        </group>
      ))}
    </group>
  )
}

function Scene() {
  const tick = useSimulationStore((state) => state.tick)
  const machines = useSimulationStore((state) => state.machines)

  useFrame(() => {
    tick()
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Queue />
      {machines.map(machine => <MachineCube key={machine.id} machine={machine} />)}
    </>
  )
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