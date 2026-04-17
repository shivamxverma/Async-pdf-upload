import { Step, STEP_LABELS, STEP_ORDER } from "../lib/types";
import { TimelineStep } from "./TimelineStep";

interface TimelineProps {
  steps: Step[];
}

export function Timeline({ steps }: TimelineProps) {
  // Ensure we show all steps in the correct order, even ones not yet reached
  const fullSteps = STEP_ORDER.map(stepName => {
    const existingStep = steps.find(s => s.name === stepName);
    return {
      name: stepName,
      status: existingStep?.status || "pending",
      label: STEP_LABELS[stepName] || stepName,
    };
  });

  return (
    <div className="py-2">
      {fullSteps.map((step, idx) => (
        <TimelineStep
          key={step.name}
          name={step.label}
          status={step.status}
          isLast={idx === fullSteps.length - 1}
        />
      ))}
    </div>
  );
}
