"use client";

import Sidebar from "@/components/Sidebar";
import Stats from "./Stats";
import ActivityGraph from "./ActivityGraph";
import RecentTickets from "./RecentTickets";

export default function DashboardPreview({ user }: { user?: { id?: string; username?: string } }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: "rgba(255,255,255,0.03)" }} aria-label="Dashboard preview" role="img">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/08 bg-[#0d0d0f]">
        <span className="size-2.5 rounded-full bg-zinc-700" />
        <span className="size-2.5 rounded-full bg-zinc-700" />
        <span className="size-2.5 rounded-full bg-zinc-700" />
        <span className="ml-3 text-xs text-zinc-500 font-mono">dashboard.silentra.app</span>
        <div className="ml-auto text-xs text-zinc-300">{user ? `${user.username}` : "Guest"}</div>
      </div>

      <div className="flex flex-col md:flex-row md:h-[480px] overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 bg-[#09090b]">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Overview</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Monday, August 4, 2026</p>
          </div>

          <div className="space-y-4">
            <Stats />
            <ActivityGraph />
            <RecentTickets />
          </div>
        </main>
      </div>
    </div>
  );
}
