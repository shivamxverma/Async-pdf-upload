"use client";

import { useJobStore } from "../store/useJobStore";
import { cn } from "../lib/utils";
import { Wifi, WifiOff, RefreshCcw } from "lucide-react";

export function LiveStatus() {
  const status = useJobStore((state) => state.connectionStatus);

  const config = {
    connected: { color: "text-green-500", bg: "bg-green-50", text: "Connected", icon: Wifi },
    reconnecting: { color: "text-yellow-500", bg: "bg-yellow-50", text: "Reconnecting...", icon: RefreshCcw },
    disconnected: { color: "text-red-500", bg: "bg-red-50", text: "Disconnected", icon: WifiOff },
  };

  const active = config[status] || config.disconnected;
  const Icon = active.icon;

  return (
    <div className={cn("flex items-center px-3 py-1.5 rounded-full border border-gray-200 shadow-sm", active.bg)}>
      <Icon className={cn("h-4 w-4 mr-2", active.color, status === "reconnecting" && "animate-spin")} />
      <span className={cn("text-xs font-medium", active.color)}>{active.text}</span>
      {status === "connected" && (
        <span className="relative flex h-2 w-2 ml-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      )}
    </div>
  );
}
