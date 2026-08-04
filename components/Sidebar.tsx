"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";

export type SidebarItem = { label: string; href?: string; active?: boolean };

const defaultItems: SidebarItem[] = [
  { label: "Overview", href: "/dashboard", active: true },
  { label: "Servers", href: "/dashboard/servers" },
  { label: "Ticket Panels", href: "/dashboard/panels" },
  { label: "Categories", href: "/dashboard/categories" },
  { label: "Staff", href: "/dashboard/staff" },
  { label: "Transcripts", href: "/dashboard/transcripts" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar({ items }: { items?: SidebarItem[] }) {
  const list = items ?? defaultItems;
  return (
    <>
      <div className="md:hidden w-full border-b border-white/08 bg-[#0f0f11] px-3 py-2 flex items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/05 border border-white/08 text-xs text-zinc-300 w-full">
          <div className="size-4 rounded bg-zinc-700 shrink-0" />
          <span className="truncate">My Server</span>
          <ChevronDown className="size-3 ml-auto text-zinc-500 shrink-0" />
        </button>
      </div>

      <aside className="hidden md:flex w-44 shrink-0 border-r border-white/08 bg-[#0f0f11] flex-col py-4">
        <div className="px-3 mb-4">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/05 border border-white/08 text-xs text-zinc-300 hover:bg-white/08 transition-colors">
            <div className="size-4 rounded bg-zinc-700 shrink-0" />
            <span className="truncate">My Server</span>
            <ChevronDown className="size-3 ml-auto text-zinc-500 shrink-0" />
          </button>
        </div>

        <nav aria-label="Sidebar navigation">
          <ul className="flex flex-col gap-0.5 px-2" role="list">
            {list.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link href={item.href} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${item.active ? "bg-white/08 text-foreground" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/05"}`}>
                    <div className="size-3.5 shrink-0 bg-zinc-700 rounded-sm" />
                    {item.label}
                  </Link>
                ) : (
                  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${item.active ? "bg-white/08 text-foreground" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/05"}`}>
                    <div className="size-3.5 shrink-0 bg-zinc-700 rounded-sm" />
                    {item.label}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
