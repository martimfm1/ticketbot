"use client";

import { AlertCircle, Clock, CheckCircle2, Circle } from "lucide-react";

export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: any; label: string }> = {
    open: { color: "text-zinc-300", icon: AlertCircle, label: "Open" },
    pending: { color: "text-zinc-400", icon: Clock, label: "Pending" },
    resolved: { color: "text-zinc-500", icon: CheckCircle2, label: "Resolved" },
  };
  const { color, icon: Icon, label } = map[status] ?? map.open;
  return (
    <span className={`flex items-center gap-1 text-xs ${color}`}>
      <Icon className="size-3" />
      {label}
    </span>
  );
}
