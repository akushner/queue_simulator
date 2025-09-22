# GEMINI.md

## Project Overview

This project is a web-based CI/CD queue simulator designed to visually demonstrate the effects of resource utilization on job completion time. It provides an interactive 3D visualization of a queueing system where jobs arrive, wait in a queue, and are processed by a configurable number of machines.

The primary goal is to illustrate how system performance degrades non-linearly as load increases, especially near full capacity.

**Core Technologies:**

*   **Frontend:** React with TypeScript
*   **Build Tool:** Vite
*   **3D Visualization:** `react-three-fiber` (a React renderer for Three.js)
*   **UI Components:** `shadcn/ui` and `tailwindcss`
*   **State Management:** Zustand

**Architecture:**

The application is structured as a single-page React application.

*   `src/App.tsx`: The main application component, which lays out the UI.
*   `src/components/Simulation.tsx`: Handles the 3D rendering of the simulation using a `react-three-fiber` Canvas. It visualizes the machines and the job queue.
*   `src/components/Controls.tsx`: Provides sliders and buttons to control the simulation parameters (job arrival rate, average job time, number of machines) and its state (start, stop, reset).
*   `src/lib/simulation.ts`: Contains the core simulation logic and state management, implemented with a Zustand store. It manages the job queue, machine states, and the simulation clock.
*   `src/lib/types.ts`: Defines the data structures for `Job` and `Machine`.

## Building and Running

### Prerequisites

*   Node.js and npm

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

To run the application locally with hot-reloading:

```bash
npm run dev
```

This will start a development server, typically on `http://localhost:5173`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The output will be placed in the `dist` directory.

### Linting

To check for code quality and type errors:

```bash
npm run lint
```

## Development Conventions

*   **Component-Based Architecture:** The UI is built using React functional components.
*   **State Management:** Global simulation state is managed centrally in a Zustand store (`src/lib/simulation.ts`).
*   **Styling:** UI styling is handled by `tailwindcss`. Reusable UI components are built using `shadcn/ui`.
*   **Path Aliases:** The project uses the `@/` alias to refer to the `src` directory for cleaner import paths.
*   **Type Safety:** TypeScript is used throughout the project to ensure type safety.
