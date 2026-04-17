import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText, RefreshCw, ChevronRight } from "lucide-react";
import { Job, STEP_LABELS } from "../lib/types";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";

interface JobRowProps {
  job: Job;
  onRetry?: () => void;
}

export function JobRow({ job, onRetry }: JobRowProps) {
  const currentStepLabel = STEP_LABELS[job.currentStep] || job.currentStep || "Initializing...";

  return (
    <div className="bg-white border rounded-lg p-4 mb-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{job.fileName}</h3>
            <p className="text-xs text-gray-500">
              Updated {formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <StatusBadge status={job.status} />
          {job.status === "failed" && onRetry && (
            <button
              onClick={onRetry}
              className="text-xs flex items-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </button>
          )}
          <Link
            href={`/job/${job.id}`}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-9">
          <ProgressBar progress={job.progress} />
        </div>
        <div className="col-span-3 text-right">
          <span className="text-xs font-medium text-gray-600">
            {job.progress}% - {currentStepLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
