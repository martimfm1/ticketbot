"use client";

import StatusBadge from "./StatusBadge";

export default function RecentTickets() {
  const recentTickets = [
    { id: "#1042", subject: "Account access issue", status: "open", time: "2m ago", user: "alex_w" },
    { id: "#1041", subject: "Bot not responding", status: "pending", time: "14m ago", user: "kate_m" },
    { id: "#1040", subject: "Role assignment", status: "resolved", time: "31m ago", user: "devuser" },
    { id: "#1039", subject: "Verification failed", status: "open", time: "1h ago", user: "new_user1" },
    { id: "#1038", subject: "Missing permissions", status: "resolved", time: "2h ago", user: "mod_jay" },
  ];

  return (
    <div className="rounded-xl border border-white/08 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
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
            <span className="text-xs text-zinc-500 font-mono w-12 shrink-0">{t.id}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-zinc-300 truncate">{t.subject}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5 sm:hidden">{t.user} · {t.time}</div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <StatusBadge status={t.status} />
              <span className="text-xs text-zinc-600 shrink-0">{t.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
