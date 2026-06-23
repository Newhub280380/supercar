"use client";

import * as React from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; bg: string; border: string }
> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/50",
  },
  confirmed: {
    label: "Confirmed",
    dot: "bg-green-400",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800/50",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800/50",
  },
  completed: {
    label: "Completed",
    dot: "bg-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-800/50",
  },
};

interface AppointmentSlotProps {
  time: string;
  serviceName: string;
  clientName: string;
  duration?: number;
  status?: "pending" | "confirmed" | "cancelled" | "completed";
  date?: string;
  onClick?: () => void;
}

function AppointmentSlot({
  time,
  serviceName,
  clientName,
  duration,
  status = "confirmed",
  date,
  onClick,
}: AppointmentSlotProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.confirmed;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex items-stretch gap-3 overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-sm cursor-pointer",
        config.bg,
        config.border
      )}
    >
      <div
        className={cn(
          "flex w-1.5 shrink-0 flex-col items-center justify-center rounded-l-xl px-3 py-3 text-xs font-medium text-foreground/80",
          status === "cancelled" && "opacity-60"
        )}
      >
        <Clock className="size-3.5" />
        <span className="mt-1.5 font-mono leading-tight">{time}</span>
      </div>
      <div className="flex flex-1 items-center justify-between gap-2 py-2.5 pr-3">
        <div className="flex flex-col gap-0.5">
          <span
            className={cn(
              "text-sm font-medium text-foreground",
              status === "cancelled" && "line-through opacity-70"
            )}
          >
            {serviceName}
          </span>
          <span className="text-xs text-muted-foreground">{clientName}</span>
          {date && (
            <span className="mt-0.5 flex items-center gap-1 text-[0.68rem] text-muted-foreground/70">
              <Calendar className="size-2.5" />
              {date}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {duration && (
            <span className="text-[0.68rem] text-muted-foreground">
              {duration} min
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", config.dot)} />
            <span className="text-[0.68rem] font-medium text-foreground/70">
              {config.label}
            </span>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-6 w-px bg-border/50" />
    </div>
  );
}

export { AppointmentSlot };
