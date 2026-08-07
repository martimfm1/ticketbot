"use client";

import { FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { DashboardMetrics } from "@/types/dashboard";

export function TranscriptsTab({ data }: { data: DashboardMetrics }) {
  const [search, setSearch] = useState("");

  const transcripts = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return data.tickets.recent;

    return data.tickets.recent.filter((ticket) =>
      [ticket.subject, ticket.channelId, ticket.userId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [data.tickets.recent, search]);

  const closedTranscripts = transcripts.filter((ticket) => ticket.status.toLowerCase() === "closed");

  return (
    <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40" aria-labelledby="transcripts-heading">
      <div className="flex flex-col gap-4 border-b border-zinc-800/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="transcripts-heading" className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <FileText className="size-4 text-zinc-500" aria-hidden="true" />
            Transcripts
          </h2>
          <p className="mt-1 text-xs text-zinc-600">History of closed support tickets.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-600" aria-hidden="true" />
          <label htmlFor="transcript-search" className="sr-only">Search transcripts</label>
          <input
            id="transcript-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search transcripts…"
            className="min-h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-xs text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-400/70"
          />
        </div>
      </div>

      <div className="divide-y divide-zinc-800/60">
        {closedTranscripts.length === 0 ? (
          <div className="px-5 py-12 text-center text-xs text-zinc-600" role="status">
            No transcripts found.
          </div>
        ) : (
          closedTranscripts.map((ticket) => (
            <div key={ticket.channelId} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm text-zinc-300">{ticket.subject || "Untitled ticket"}</p>
                <p className="mt-1 font-mono text-[10px] text-zinc-600">Channel {ticket.channelId} · User {ticket.userId}</p>
              </div>
              <time className="shrink-0 text-[10px] text-zinc-600" dateTime={ticket.closedAt ?? undefined}>
                {ticket.closedAt ? new Date(ticket.closedAt).toLocaleDateString("en-US") : "—"}
              </time>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
