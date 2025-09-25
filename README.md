# CI/CD Queue Simulator

## What is this?

This project is an interactive, web-based simulator designed to visualize a generic task queuing system, such as a CI/CD pipeline. It provides a visual representation of jobs arriving, waiting in a queue, and being processed by a configurable number of machines.

The primary goal is to allow users to observe the relationships between job arrival rates, processing times, and the number of available resources, and to understand how these factors impact system performance and wait times.

The simulation is rendered in 3D and provides real-time metrics and graphs to help you understand the system's behavior under different loads.

## Why build this? (Five Guesses)

Based on the features we've built and explored, here are five reasons why I think you might be working on this program:

1.  **To Visualize and Understand Queuing Theory:** This simulator is a powerful learning tool. It turns abstract concepts like Little's Law, the non-linear relationship between utilization and wait time, and the impact of variability into something tangible and interactive. It's one thing to read about queuing theory; it's another to see it in action.

2.  **For Capacity Planning and "What-If" Analysis:** You've shown a keen interest in predictive metrics like "Est. Time for Newest Job" and "Additional Hosts Needed." This suggests you're using the simulator as a tool for capacity planning, to answer questions like, "If our workload doubles, how many more machines will we need to maintain our service level objectives?"

3.  **As a Communication and Teaching Tool:** The visual and interactive nature of this simulator makes it an excellent way to explain complex system dynamics to a team. It can help build a shared intuition about why systems slow down under load and why simply running at 80% utilization can lead to long queues.

4.  **To Create a Sandbox for System Design:** We've discussed many potential features, such as job priorities, different machine types, and autoscaling algorithms. This simulator is becoming a safe and inexpensive sandbox where you can experiment with different system designs and scheduling strategies to see how they perform before implementing them in a real-world production environment.

5.  **Because It's a Fun and Challenging Project:** Let's be honest, building a 3D, real-time simulation is a fun and rewarding challenge. It combines logic, data visualization, and user interface design. The end result is a visually engaging tool that is both useful and impressive, which is a great motivator for any developer.