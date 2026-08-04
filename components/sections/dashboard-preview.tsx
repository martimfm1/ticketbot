"use client";

import {
  LayoutDashboard,
  Server,
  PanelTop,
  FolderTree,
  Users,
  FileText,
  BarChart3,
  Settings,
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  stats,
  recentTickets,
  activityData,
  recentActivity,
  sidebarItems,
  servers,
} from "@/lib/data";

const iconMap = {
  LayoutDashboard,
  Server,
  PanelTop,
  FolderTree,
  Users,
  FileText,
  BarChart3,
  Settings,
};

const priorityVariant: Record<string, "default" | "warning" | "error"> = {
  High: "error",
  Medium: "warning",
  Low: "default",
};

const statusIcon: Record<string, typeof Clock> = {
  Open: AlertCircle,
  "In Progress": Clock,
  Resolved: CheckCircle2,
};

const statusColor: Record<string, string> = {
  Open: "text-red-400",
  "In Progress": "text-yellow-400",
  Resolved: "text-green-400",
};

export function DashboardPreview() {
  const maxValue = Math.max(...activityData.map((d) => d.value));

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d0f] shadow-glass">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-white/10" />
          <div className="h-3 w-3 rounded-full bg-white/10" />
          <div className="h-3 w-3 rounded-full bg-white/10" />
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <span className="hidden sm:inline">dashboard.silentra.io</span>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          <Bell className="h-3.5 w-3.5 text-zinc-500" />
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px]">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex h-[560px]">
        {/* Sidebar */}
        <aside className="hidden w-[180px] shrink-0 flex-col border-r border-white/8 bg-[#0a0a0c] p-3 sm:flex">
          {/* Server selector */}
          <button className="mb-4 flex items-center justify-between rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-left transition-colors hover:bg-white/10">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-[10px] font-semibold text-white">
                NS
              </div>
              <div className="leading-none">
                <div className="text-xs font-medium text-white">Nova Studios</div>
                <div className="mt-0.5 text-[9px] text-zinc-500">24.5K members</div>
              </div>
            </div>
            <ChevronDown className="h-3 w-3 text-zinc-500" />
          </button>

          <nav className="flex flex-1 flex-col gap-0.5">
            {sidebarItems.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              return (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors",
                    item.active
                      ? "bg-white/10 text-white"
                      : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>

          <div className="mt-auto rounded-lg border border-white/8 bg-white/5 p-2.5">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px]">JD</AvatarFallback>
              </Avatar>
              <div className="leading-none">
                <div className="text-xs font-medium text-white">Jordan Doe</div>
                <div className="mt-0.5 text-[9px] text-zinc-500">Admin</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Overview</h3>
              <p className="text-[10px] text-zinc-500">
                Welcome back, here's what's happening today
              </p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/5 px-2.5 py-1.5 text-[10px] text-zinc-300 transition-colors hover:bg-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Last 7 days
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>
          </div>

          <div className="h-[calc(560px-49px)] overflow-y-auto no-scrollbar p-4">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="rounded-xl border border-white/8 bg-white/[0.03] p-3"
                >
                  <div className="text-[10px] text-zinc-500">{stat.label}</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-lg font-semibold text-white">
                      {stat.value}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-0.5 text-[10px]",
                        stat.trend === "up" ? "text-green-400" : "text-green-400"
                      )}
                    >
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-2.5 w-2.5" />
                      ) : (
                        <TrendingDown className="h-2.5 w-2.5" />
                      )}
                      {stat.change}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Activity graph */}
            <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    Ticket Activity
                  </h4>
                  <p className="text-[10px] text-zinc-500">Tickets per day</p>
                </div>
                <Badge variant="default">Weekly</Badge>
              </div>
              <div className="flex h-24 items-end justify-between gap-2">
                {activityData.map((d, i) => (
                  <div
                    key={d.day}
                    className="flex flex-1 flex-col items-center gap-1.5"
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${(d.value / maxValue) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
                      className="w-full rounded-md bg-gradient-to-t from-white/10 to-white/30"
                      style={{ minHeight: 4 }}
                    />
                    <span className="text-[9px] text-zinc-600">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent tickets */}
            <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.03]">
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
                <h4 className="text-xs font-semibold text-white">
                  Recent Tickets
                </h4>
                <button className="text-[10px] text-zinc-500 hover:text-white">
                  View all
                </button>
              </div>
              <div className="divide-y divide-white/8">
                {recentTickets.slice(0, 4).map((ticket) => {
                  const StatusIcon = statusIcon[ticket.status];
                  return (
                    <div
                      key={ticket.id}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.02]"
                    >
                      <span className="text-[10px] font-mono text-zinc-600">
                        {ticket.id}
                      </span>
                      <div className="flex-1 overflow-hidden">
                        <div className="truncate text-xs text-white">
                          {ticket.subject}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {ticket.user} · {ticket.time}
                        </div>
                      </div>
                      <Badge
                        variant={priorityVariant[ticket.priority]}
                        className="hidden sm:inline-flex"
                      >
                        {ticket.priority}
                      </Badge>
                      <div
                        className={cn(
                          "flex items-center gap-1 text-[10px]",
                          statusColor[ticket.status]
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        <span className="hidden sm:inline">{ticket.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent activity */}
            <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] p-4">
              <h4 className="mb-3 text-xs font-semibold text-white">
                Recent Activity
              </h4>
              <div className="space-y-2.5">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[9px]">
                        {act.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-[11px]">
                      <span className="font-medium text-white">{act.user}</span>
                      <span className="text-zinc-500"> {act.action}</span>
                    </div>
                    <span className="text-[10px] text-zinc-600">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
