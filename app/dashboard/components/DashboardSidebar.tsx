"use client";

import {
  BarChart3,
  FileText,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Server,
  Settings,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const dashboardNavigation = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Inbox", icon: Inbox },
  { name: "Servers", icon: Server },
  { name: "Ticket Panels", icon: Ticket },
  { name: "Categories", icon: Layers },
  { name: "Staff", icon: Users },
  { name: "Transcripts", icon: FileText },
  { name: "Analytics", icon: BarChart3 },
  { name: "Settings", icon: Settings },
] as const;

export interface DashboardGuild {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
}

interface DashboardSidebarProps {
  activeTab: string;
  guildId: string;
  guilds: DashboardGuild[];
  user: { id: string; name: string; image: string | null };
  onNavigate: (tab: string) => void;
  onGuildChange: (guildId: string) => void;
}

export function DashboardSidebar({ activeTab, guildId, guilds, user, onNavigate, onGuildChange }: DashboardSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentGuild = guilds.find((guild) => guild.id === guildId) ?? null;
  const mobileNavigation = dashboardNavigation.slice(0, 4);

  useEffect(() => {
    setMobileOpen(false);
  }, [activeTab]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  function handleNavigate(tab: string) {
    onNavigate(tab);
    setMobileOpen(false);
  }

  function GuildSelector({ compact = false }: { compact?: boolean }) {
    return (
      <Select value={guildId} onValueChange={(value) => value && onGuildChange(value)} disabled={guilds.length === 0}>
        <SelectTrigger className={compact ? "h-11 min-w-0 flex-1 border-zinc-800 bg-zinc-950 px-3 shadow-none focus:ring-0" : "h-12 w-full border-zinc-800 bg-zinc-950 px-3 shadow-none hover:bg-zinc-900 focus:ring-0"}>
          <SelectValue placeholder="Select a server">
            {currentGuild && (
              <div className="flex min-w-0 items-center gap-2.5">
                {currentGuild.icon ? (
                  <Image src={currentGuild.icon} alt="" width={28} height={28} className="size-7 shrink-0 rounded-md object-cover" />
                ) : (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-xs font-semibold text-zinc-300">{currentGuild.name.charAt(0).toUpperCase()}</div>
                )}
                <div className="min-w-0 text-left">
                  <p className="truncate text-xs font-medium text-zinc-200">{currentGuild.name}</p>
                  <p className="hidden truncate font-mono text-[9px] text-zinc-600 sm:block">{currentGuild.id}</p>
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="start" className="w-[min(300px,calc(100vw-2rem))] border-zinc-800 bg-zinc-950">
          {guilds.map((guild) => (
            <SelectItem key={guild.id} value={guild.id} className="cursor-pointer py-3 focus:bg-zinc-900 focus:text-zinc-100">
              <div className="flex min-w-0 items-center gap-2.5">
                {guild.icon ? <Image src={guild.icon} alt="" width={32} height={32} className="size-8 shrink-0 rounded-md object-cover" /> : <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-xs font-semibold text-zinc-300">{guild.name.charAt(0).toUpperCase()}</div>}
                <div className="min-w-0">
                  <p className="max-w-[210px] truncate text-xs font-medium">{guild.name}</p>
                  <p className="hidden font-mono text-[9px] text-zinc-600 sm:block">{guild.id}</p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  function UserRow() {
    return (
      <div className="flex items-center gap-3">
        {user.image ? <Image src={user.image} alt={user.name} width={32} height={32} className="size-8 shrink-0 rounded-full border border-zinc-800 object-cover" /> : <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300">{user.name.charAt(0).toUpperCase()}</div>}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-zinc-200">{user.name}</p>
          <p className="truncate font-mono text-[10px] text-zinc-500">#{user.id.slice(0, 5)}</p>
        </div>
        <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-200" title="Logout" aria-label="Logout">
          <LogOut className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-800/80 lg:flex">
        <div className="border-b border-zinc-800/80 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
              <Server className="size-3.5 text-zinc-400" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Server</span>
          </div>
          <GuildSelector />
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-wider text-zinc-600">Dashboard</p>
          <nav className="space-y-1">
            {dashboardNavigation.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.name;
              return (
                <button key={item.name} type="button" onClick={() => onNavigate(item.name)} className={["flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors", active ? "border-zinc-800 bg-zinc-900 text-zinc-100" : "border-transparent text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-200"].join(" ")}>
                  <Icon className="size-4 shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-zinc-800/80 p-4"><UserRow /></div>
      </aside>

      <div className="fixed inset-x-0 top-0 z-40 border-b border-zinc-800/80 bg-black/90 px-3 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <GuildSelector compact />
          <button type="button" onClick={() => setMobileOpen(true)} className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300" aria-label="Open dashboard menu">
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800/80 bg-black/90 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl lg:hidden">
        <nav className="mx-auto grid max-w-xl grid-cols-5 gap-1">
          {mobileNavigation.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.name;
            return (
              <button key={item.name} type="button" onClick={() => handleNavigate(item.name)} className={["flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[10px] font-medium", active ? "bg-zinc-900 text-zinc-100" : "text-zinc-500"].join(" ")}>
                <Icon className="size-4" />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-zinc-100">Dashboard</p>
                <p className="mt-0.5 text-[11px] text-zinc-600">SILENTRA Ticket</p>
              </div>
              <button type="button" onClick={() => setMobileOpen(false)} className="flex size-10 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200" aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              {dashboardNavigation.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.name;
                return (
                  <button key={item.name} type="button" onClick={() => handleNavigate(item.name)} className={["flex min-h-12 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium", active ? "bg-zinc-900 text-zinc-100" : "text-zinc-500 hover:bg-zinc-900/70 hover:text-zinc-200"].join(" ")}>
                    <Icon className="size-5" />
                    {item.name}
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-zinc-800/80 p-4"><UserRow /></div>
          </aside>
        </div>
      )}
    </>
  );
}
