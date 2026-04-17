import { Check, Circle, Loader2 } from "lucide-react";
import { StepStatus } from "../lib/types";
import { cn } from "../lib/utils";

interface TimelineStepProps {
  name: string;
  status: StepStatus;
  isLast?: boolean;
}

export function TimelineStep({ name, status, isLast }: TimelineStepProps) {
  return (
    <div className="relative flex items-center mb-6 last:mb-0 group">
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-gray-200 group-last:hidden" />
      )}
      
      <div className={cn(
        "relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
        status === "done" ? "border-green-500 bg-green-500" :
        status === "active" ? "border-blue-500 text-blue-500 bg-white" :
        "border-gray-300 bg-white"
      )}>
        {status === "done" && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        {status === "active" && <Loader2 className="h-3 w-3 animate-spin" />}
        {status === "pending" && <Circle className="h-2 w-2 text-gray-300 fill-current" />}
      </div>
      
      <div className="ml-4 flex flex-col">
        <span className={cn(
          "text-sm font-medium",
          status === "pending" ? "text-gray-400" : "text-gray-900"
        )}>
          {name}
        </span>
      </div>
    </div>
  );
}
