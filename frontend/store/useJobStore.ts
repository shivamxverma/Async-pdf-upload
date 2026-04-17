import { create } from "zustand";
import { Job, JobStatus, PROGRESS_MAPPING, STEP_ORDER } from "../lib/types";

interface JobState {
  jobs: Record<string, Job>;
  connectionStatus: "connected" | "reconnecting" | "disconnected";
  setConnectionStatus: (status: "connected" | "reconnecting" | "disconnected") => void;
  setJobs: (jobs: Job[]) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  addJob: (job: Job) => void;
  handleIncomingEvent: (event: { job_id: string; event: string; status?: JobStatus; error?: string }) => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: {},
  connectionStatus: "disconnected",
  
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  setJobs: (jobsList) => {
    const jobsRecord = jobsList.reduce((acc, job) => {
      acc[job.id] = job;
      return acc;
    }, {} as Record<string, Job>);
    set({ jobs: jobsRecord });
  },

  updateJob: (id, updates) => set((state) => {
    const existing = state.jobs[id];
    if (!existing) return state;
    return {
      jobs: {
        ...state.jobs,
        [id]: { ...existing, ...updates, updatedAt: new Date().toISOString() }
      }
    };
  }),

  addJob: (job) => set((state) => ({
    jobs: { ...state.jobs, [job.id]: job }
  })),

  handleIncomingEvent: (payload) => set((state) => {
    const { job_id, event, status, error } = payload;
    const existing = state.jobs[job_id];
    if (!existing) return state;

    const progress = PROGRESS_MAPPING[event] ?? existing.progress;
    
    let newStatus = existing.status;
    if (status) {
      newStatus = status;
    } else if (event === "job_completed" || event === "completed") {
      newStatus = "completed";
    } else if (event === "job_failed" || event === "failed") {
      newStatus = "failed";
    } else if (progress > 0 && progress < 100 && existing.status === "queued") {
      newStatus = "processing";
    }

    const updatedSteps = existing.steps.map(step => {
      const stepIndex = STEP_ORDER.indexOf(step.name);
      const currentIndex = STEP_ORDER.indexOf(event);
      
      if (step.name === event) {
        return { ...step, status: "active", timestamp: new Date().toISOString() };
      }
      
      if (currentIndex !== -1 && stepIndex !== -1) {
        if (stepIndex < currentIndex) {
          return { ...step, status: "done", timestamp: step.timestamp || new Date().toISOString() };
        }
      }
      return step;
    });

    // Special case for done
    if (newStatus === "completed") {
      updatedSteps.forEach(step => {
        if (step.status !== "done") step.status = "done";
      });
    }

    return {
      jobs: {
        ...state.jobs,
        [job_id]: {
          ...existing,
          progress,
          status: newStatus,
          currentStep: event,
          steps: updatedSteps,
          updatedAt: new Date().toISOString()
        }
      }
    };
  }),
}));
