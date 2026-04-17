export type JobStatus = "queued" | "processing" | "completed" | "failed";
export type StepStatus = "pending" | "active" | "done";

export type Step = {
  name: string;
  status: StepStatus;
  timestamp?: string;
};

export type Job = {
  id: string;
  fileName: string;
  status: JobStatus;
  progress: number;
  currentStep: string;
  steps: Step[];
  createdAt: string;
  updatedAt: string;
};

export type ExtractedData = {
  title: string;
  category: string;
  summary: string;
  keywords: string[];
};

export const PROGRESS_MAPPING: Record<string, number> = {
  queued: 0,
  parsing_started: 20,
  parsing_completed: 40,
  extraction_started: 60,
  extraction_completed: 80,
  final_result_stored: 90,
  completed: 100,
  job_completed: 100,
  failed: 100,
  job_failed: 100,
  document_received: 10
};

export const STEP_ORDER = [
  "document_received",
  "parsing_started",
  "parsing_completed",
  "extraction_started",
  "extraction_completed",
  "final_result_stored"
];

export const STEP_LABELS: Record<string, string> = {
  document_received: "Document Received",
  parsing_started: "Parsing Started",
  parsing_completed: "Parsing Completed",
  extraction_started: "Extraction Started",
  extraction_completed: "Extraction Completed",
  final_result_stored: "Final Result Stored"
};
