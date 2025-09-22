import { Controls } from "@/components/Controls";
import { Simulation } from "@/components/Simulation";

function App() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-7xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8">CI/CD Queue Simulator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[600px] bg-card rounded-lg shadow-lg">
            <Simulation />
          </div>
          <div className="h-[600px] bg-card rounded-lg shadow-lg p-6">
            <Controls />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;