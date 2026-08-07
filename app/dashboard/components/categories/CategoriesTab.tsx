import { Layers } from "lucide-react";
import type { DashboardMetrics } from "@/types/dashboard";

interface CategoriesTabProps {
  data: DashboardMetrics;
  onEdit: () => void;
}

export function CategoriesTab({ data, onEdit }: CategoriesTabProps) {
  const categoryId = data.servers.current?.ticketCategoryId;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40" aria-labelledby="category-heading">
        <div className="flex items-center justify-between border-b border-zinc-800/70 px-5 py-4 gap-4">
          <div>
            <h2 id="category-heading" className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
              <Layers className="size-4 text-zinc-500" aria-hidden="true" />
              Ticket category
            </h2>
            <p className="mt-1 text-xs text-zinc-600">Category used to create new support tickets.</p>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="min-h-9 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/70"
          >
            Edit
          </button>
        </div>

        <div className="p-5">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Category ID</p>
          <p className="mt-2 font-mono text-sm text-zinc-300">{categoryId || "Not configured"}</p>
        </div>
      </section>
    </div>
  );
}
