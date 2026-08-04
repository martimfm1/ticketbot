"use client";

import {
  LayoutDashboard,
  Server,
  TicketCheck,
  Layers,
  Users,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Server, label: "Servers" },
  { icon: TicketCheck, label: "Ticket Panels" },
  { icon: Layers, label: "Categories" },
  { icon: Users, label: "Staff" },
  { icon: FileText, label: "Transcripts" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

const stats = [
  { label: "Open Tickets", value: "24", delta: "+3", up: true },
  { label: "Resolved Today", value: "58", delta: "+12", up: true },
  { label: "Avg. Response", value: "4m", delta: "-1m", up: true },
  { label: "Active Staff", value: "7", delta: "0", up: null },
];

const recentTickets = [
  { id: "#1042", subject: "Account access issue", status: "open", time: "2m ago", user: "alex_w" },
  { id: "#1041", subject: "Bot not responding", status: "pending", time: "14m ago", user: "kate_m" },
  { id: "#1040", subject: "Role assignment", status: "resolved", time: "31m ago", user: "devuser" },
  { id: "#1039", subject: "Verification failed", status: "open", time: "1h ago", user: "new_user1" },
  { id: "#1038", subject: "Missing permissions", status: "resolved", time: "2h ago", user: "mod_jay" },
];

const activityData = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: typeof Circle; label: string }> = {
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

export function DashboardPreview() {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
      style={{ background: "rgba(255,255,255,0.03)" }}
      aria-label="Dashboard preview"
      role="img"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/08 bg-[#0d0d0f]">
        <span className="size-2.5 rounded-full bg-zinc-700" />
        <span className="size-2.5 rounded-full bg-zinc-700" />
        <span className="size-2.5 rounded-full bg-zinc-700" />
        <span className="ml-3 text-xs text-zinc-500 font-mono">ticketbot.silentra.me</span>
      </div>

      <div className="flex h-[480px] overflow-hidden">
        {/* Sidebar */}
        <aside className="w-44 shrink-0 border-r border-white/08 bg-[#0f0f11] flex flex-col py-4">
          {/* Server selector */}
          <div className="px-3 mb-4">
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/05 border border-white/08 text-xs text-zinc-300 hover:bg-white/08 transition-colors">
              <div className="size-4 rounded bg-zinc-700 shrink-0" />
              <span className="truncate">My Server</span>
              <ChevronDown className="size-3 ml-auto text-zinc-500 shrink-0" />
            </button>
          </div>

          <nav aria-label="Dashboard sidebar">
            <ul className="flex flex-col gap-0.5 px-2" role="list">
              {sidebarItems.map((item) => (
                <li key={item.label}>
                  <div
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      item.active
                        ? "bg-white/08 text-foreground"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/05"
                    }`}
                  >
                    <item.icon className="size-3.5 shrink-0" />
                    {item.label}
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 bg-[#09090b]">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Overview</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Monday, August 4, 2026</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3 border border-white/08"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-semibold text-foreground">{s.value}</span>
                  {s.up !== null && (
                    <span className="text-xs text-zinc-400 flex items-center gap-0.5">
                      <ArrowUpRight className="size-3" />
                      {s.delta}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Activity graph */}
          <div
            className="rounded-xl p-3 border border-white/08 mb-4"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <p className="text-xs text-zinc-500 mb-3">Ticket Activity (24h)</p>
            <div className="flex items-end gap-1 h-12">
              {activityData.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-zinc-700 hover:bg-zinc-500 transition-colors"
                  style={{ height: `${v}%` }}
                />
              ))}
            </div>
          </div>

          {/* Recent tickets */}
          <div
            className="rounded-xl border border-white/08 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className="px-3 py-2 border-b border-white/08 flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Recent Tickets</p>
              <span className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-300">View all</span>
            </div>
            <ul role="list">
              {recentTickets.map((t, i) => (
                <li
                  key={t.id}
                  className={`px-3 py-2 flex items-center gap-3 hover:bg-white/03 transition-colors ${
                    i < recentTickets.length - 1 ? "border-b border-white/05" : ""
                  }`}
                >
                  <span className="text-xs text-zinc-500 font-mono w-10 shrink-0">{t.id}</span>
                  <span className="text-xs text-zinc-300 flex-1 truncate">{t.subject}</span>
                  <StatusBadge status={t.status} />
                  <span className="text-xs text-zinc-600 shrink-0 hidden sm:block">{t.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
