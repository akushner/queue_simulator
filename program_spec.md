## **Specification: CI/CD Queue Simulator**

### **I. Overview**

The program is an interactive, web-based simulator designed to visualize a generic task queuing system, such as a CI/CD pipeline. It provides a visual representation of jobs arriving, waiting in a queue, and being processed by a configurable number of machines.

The primary goal is to allow users to observe the relationships between job arrival rates, processing times, and the number of available resources, and to understand how these factors impact system performance and wait times.

### **II. Core Concepts**

The simulation is built around two fundamental data structures:

*   **Job:** Represents a unit of work to be done.
    *   **Properties:**
        *   `id`: A unique identifier for the job.
        *   `startTime`: The timestamp (in simulation ticks) when the job was created.
        *   `processingTime`: The amount of time (in simulation ticks) required to complete the job once a machine starts working on it.
        *   `startedProcessingTime`: The timestamp when a machine starts processing the job. This is null if the job is still in the queue.

*   **Machine:** Represents a resource that can process a job.
    *   **Properties:**
        *   `id`: A unique identifier for the machine.
        *   `job`: A reference to the Job object it is currently processing. This is null if the machine is idle.
        *   `finishTime`: The timestamp when the machine will finish its current job. This is null if the machine is idle.
        *   `status`: The current state of the machine, which can be 'active' (available for work) or 'removing' (marked for removal and will be decommissioned after finishing its current job).

### **III. Simulation Engine**

The engine is the core of the program, responsible for managing the simulation state and logic. It operates in discrete time steps called "ticks."

#### **A. State Management**

The engine must maintain the following state variables:

*   **Simulation Time:** An integer representing the current time in ticks, starting from 0.
*   **Simulation Status:** A boolean indicating whether the simulation is currently running or paused.
*   **Job Queue:** An ordered list of Job objects that are waiting to be processed.
*   **Machine Pool:** A list of all Machine objects in the simulation.
*   **Completed Jobs:** A list of all jobs that have been successfully processed.
*   **Historical Data:**
    *   A list tracking the size of the Job Queue at each tick.
    *   A list tracking the percentage of busy machines (utilization) at each tick.
    *   A list tracking the calculated number of additional machines needed at each tick.

#### **B. Configurable Parameters**

The engine's behavior is controlled by the following user-configurable parameters:

*   **Job Arrival Rate:** The average number of new jobs that arrive per minute.
*   **Average Job Time:** The average processing time for a new job. The actual processing time for each job should be randomized around this value.
*   **Number of Machines:** The total number of machines in the simulation.
*   **Time Scale:** A multiplier that controls the speed of the simulation (e.g., a time scale of 2 would make the simulation run twice as fast as real-time).

#### **C. Simulation Loop (The "Tick" Function)**

On each tick of the simulation, if the status is "running," the following actions must occur in order:

1.  **Increment Time:** The simulation time is advanced by one tick.
2.  **Process Finished Jobs:** Iterate through all machines. If a machine's `finishTime` is less than or equal to the current simulation time, the job on that machine is considered complete. The job is moved to the "Completed Jobs" list, and the machine becomes idle (its `job` and `finishTime` are set to null).
3.  **Decommission Machines:** Remove any machines from the Machine Pool that are marked as 'removing' and are currently idle.
4.  **Assign New Jobs:** Iterate through all idle and 'active' machines. For each available machine, take the next job from the front of the Job Queue. Update the job's `startedProcessingTime` and the machine's `job` and `finishTime`.
5.  **Generate New Jobs:** Based on the "Job Arrival Rate," probabilistically determine if a new job should be created at this tick. If so, create a new Job object with a randomized `processingTime` based on the "Average Job Time" and add it to the end of the Job Queue.
6.  **Update Historical Data:** Calculate the current queue size, machine utilization, and the number of additional machines needed, and append these values to their respective history lists.

### **IV. User Interface**

The user interface should be divided into several distinct panels:

*   **Controls Panel:**
    *   Provides sliders or input fields for the user to adjust all **Configurable Parameters** in real-time.
    *   Includes "Start," "Stop," and "Reset" buttons to control the simulation.

*   **Metrics Panel:**
    *   Displays key performance indicators, which should update in real-time:
        *   Current Simulation Time
        *   Jobs in Queue
        *   Running Jobs (number of busy machines)
        *   Total Processed Jobs
        *   Average Service Time (average `processingTime` of all completed jobs)
        *   Average Queue Time (average time jobs spent in the queue)
        *   Estimated Time for Newest Job (estimated time until the entire queue is cleared)

*   **3D Visualization Panel:**
    *   A 3D representation of the simulation state:
        *   **Queue:** Jobs in the queue are visualized as a vertical stack of cubes.
        *   **Machines:** Each machine is represented as a horizontal lane.
        *   **Job Flow:** When a job is being processed, its corresponding cube should be shown moving from the start to the end of the machine's lane over the duration of its `processingTime`.

*   **Queue Meter Widget:**
    *   A vertical bar that visually represents the number of jobs in the queue.
    *   The bar should fill up as the queue size increases.
    *   The ID of the newest job should be displayed at the top of the bar, and the ID of the oldest job at the bottom.

*   **Graphs Area:**
    *   **Host Utilization Graph:** A 2D line graph plotting the percentage of busy machines (Y-axis) against simulation time (X-axis).
    *   **Additional Hosts Needed Graph:** A 2D line graph plotting the calculated number of additional machines needed to keep the queue wait time below a set threshold (Y-axis) against simulation time (X-axis).

### **V. Data Flow and Interaction**

*   The UI must be connected to the Simulation Engine in such a way that it automatically updates whenever the engine's state changes.
*   User actions in the Controls Panel must immediately update the corresponding parameters in the Simulation Engine.
*   The "Reset" button should restore the simulation to its initial state (time = 0, all queues and histories cleared, etc.).

---
*Prompt used to generate this specification:*

> Without mentioning any libraries, I'd like you to create a detailed specification of the functioning of this program such that another person or LLM could read it and implement it in a language of their choice.