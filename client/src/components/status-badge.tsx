import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-orange-100 text-orange-700 border-orange-200",
    active: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const labels = {
    pending: "Waiting for Doctor",
    active: "In Progress",
    completed: "Completed",
  };

  const key = status as keyof typeof styles;

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5",
      styles[key] || styles.pending
    )}>
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        key === 'active' ? 'bg-green-500 animate-pulse' : 
        key === 'pending' ? 'bg-orange-500' : 'bg-gray-500'
      )} />
      {labels[key] || status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const styles = {
    high: "bg-red-50 text-red-700 border-red-100",
    medium: "bg-blue-50 text-blue-700 border-blue-100",
    low: "bg-gray-50 text-gray-600 border-gray-100",
  };

  const key = priority as keyof typeof styles;

  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-xs font-medium border uppercase tracking-wide",
      styles[key] || styles.medium
    )}>
      {priority} Priority
    </span>
  );
}
