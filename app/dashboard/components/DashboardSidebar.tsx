"use client";

import { BarChart3, CreditCard, FileText, Inbox, Layers, LayoutDashboard, LogOut, Menu, Server, Settings, Ticket, Users, X, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const dashboardNavigation = [
  { group: "Workspace", items: [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Inbox", icon: Inbox },
    { name: "Servers", icon: Server },
    { name: "Ticket Panels", icon: Ticket },
    { name: "Categories", icon: Layers },
  ] },
  { group: "Operations", items: [
    { name: "Staff", icon: Users },
    { name: "Transcripts", icon: FileText },
    { name: "Analytics", icon: BarChart3 },
  ] },
  { group: "Account", items: [
    { name: "Billing", icon: CreditCard },
    { name: "Settings", icon: Settings },
  ] },
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

  useEffect(() => setMobileOpen(false), [activeTab]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const guildSelector = (compact = false) => (
    <Select value={guildId} onValueChange={(value) => value && onGuildChange(value)} disabled={!guilds.length}>
      <SelectTrigger className={compact ? "h-11 min-w-0 flex-1 border-white/8 bg-white/[0.03] px-3 shadow-none focus:ring-0" : "h-12 w-full border-white/8 bg-white/[0.03] px-3 shadow-none hover:bg-white/[0.05] focus:ring-0"}>
        <SelectValue placeholder="Selecionar servidor">
          {currentGuild ? <div className="flex min-w-0 items-center gap-2.5"><div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-300">{currentGuild.icon ? <Image src={currentGuild.icon} alt="" width={32} height={32} className="size-full object-cover" /> : currentGuild.name.charAt(0).toUpperCase()}</div><div className="min-w-0 text-left"><p className="truncate text-xs font-medium text-zinc-200">{currentGuild.name}</p><p className="truncate font-mono text-[9px] text-zinc-600">{currentGuild.id}</p></div></div> : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" className="w-[min(320px,calc(100vw-2rem))] border-white/10 bg-zinc-950">
        {guilds.map((guild) => <SelectItem key={guild.id} value={guild.id} className="cursor-pointer py-3 focus:bg-white/[0.06] focus:text-zinc-100"><div className="flex items-center gap-2.5"><div className="flex size-8 items-center justify-center overflow-hidden rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-300">{guild.icon ? <Image src={guild.icon} alt="" width={32} height={32} className="size-full object-cover" /> : guild.name.charAt(0).toUpperCase()}</div><span className="max-w-[220px] truncate text-xs">{guild.name}</span></div></SelectItem>)}
      </SelectContent>
    </Select>
  );

  const userRow = <div className="flex items-center gap-3"><div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/8 bg-zinc-900 text-xs font-medium text-zinc-300">{user.image ? <Image src={user.image} alt={user.name} width={36} height={36} className="size-full object-cover" /> : user.name.charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-zinc-200">{user.name}</p><p className="truncate font-mono text-[10px] text-zinc-600">{user.id}</p></div><button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="flex size-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/[0.05] hover:text-zinc-200" aria-label="Terminar sessão"><LogOut className="size-4" /></button></div>;

  const nav = (mobile = false) => dashboardNavigation.map((section) => <div key={section.group} className="mb-5"><p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-600">{section.group}</p><div className="space-y-1">{section.items.map((item) => { const Icon = item.icon; const active = activeTab === item.name; return <button key={item.name} type="button" onClick={() => { onNavigate(item.name); setMobileOpen(false); }} className={["flex min-h-10 w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-xs font-medium transition", active ? "border-white/8 bg-white/[0.06] text-white shadow-sm" : "border-transparent text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-200", mobile ? "min-h-12 text-sm" : ""].join(" ")}><Icon className="size-4 shrink-0" />{item.name}{item.name === "Billing" && activeTab !== "Billing" ? <span className="ml-auto rounded-full bg-emerald-400/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-emerald-300">Pro</span> : null}</button>; })}</div></div>);

  return <>
    <aside className="hidden w-[270px] shrink-0 border-r border-white/6 bg-black/25 lg:flex lg:flex-col lg:backdrop-blur-xl">
      <div className="border-b border-white/6 p-5"><div className="mb-5 flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04]"><Sparkles className="size-4 text-emerald-300" /></div><div><p className="text-sm font-semibold tracking-tight text-white">SILENTRA</p><p className="text-[10px] text-zinc-600">Ticket Control Center</p></div></div>{guildSelector()}</div>
      <div className="flex-1 overflow-y-auto p-4">{nav()}</div>
      <div className="border-t border-white/6 p-4">{userRow}</div>
    </aside>

    <div className="fixed inset-x-0 top-0 z-40 border-b border-white/6 bg-[#070707]/90 px-3 py-3 backdrop-blur-xl lg:hidden"><div className="flex items-center gap-2">{guildSelector(true)}<button type="button" onClick={() => setMobileOpen(true)} className="flex size-11 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-zinc-300" aria-label="Abrir menu"><Menu className="size-5" /></button></div></div>
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/6 bg-[#070707]/92 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl lg:hidden"><div className="mx-auto grid max-w-xl grid-cols-5 gap-1">{[...dashboardNavigation[0].items.slice(0, 4), dashboardNavigation[2].items[0]].map((item) => { const Icon = item.icon; const active = activeTab === item.name; return <button key={item.name} type="button" onClick={() => onNavigate(item.name)} className={["flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium", active ? "bg-white/[0.06] text-white" : "text-zinc-500"].join(" ")}><Icon className="size-4" /><span>{item.name === "Ticket Panels" ? "Panels" : item.name}</span></button>; })}</div></div>

    {mobileOpen ? <div className="fixed inset-0 z-50 lg:hidden"><button type="button" className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" /><aside className="absolute right-0 top-0 flex h-full w-[min(90vw,370px)] flex-col border-l border-white/8 bg-[#080808] shadow-2xl"><div className="flex items-center justify-between border-b border-white/6 px-5 py-4"><div><p className="text-sm font-semibold text-white">SILENTRA</p><p className="mt-0.5 text-[10px] text-zinc-600">Ticket Control Center</p></div><button type="button" onClick={() => setMobileOpen(false)} className="flex size-10 items-center justify-center rounded-xl text-zinc-500 hover:bg-white/[0.05] hover:text-white" aria-label="Fechar"><X className="size-5" /></button></div><div className="flex-1 overflow-y-auto p-4">{nav(true)}</div><div className="border-t border-white/6 p-4">{userRow}</div></aside></div> : null}
  </>;
}
