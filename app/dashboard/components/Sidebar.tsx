"use client";

import { ChevronDown } from "lucide-react";

const sidebarItems = [
  { label: "Overview", active: true },
  { label: "Servers" },
  { label: "Ticket Panels" },
  { label: "Categories" },
  { label: "Staff" },
  { label: "Transcripts" },
  { label: "Analytics" },
  { label: "Settings" },
];

export default function Sidebar() {
  return (
    <>
      {/* Mobile top bar: server selector */}
      <div className="md:hidden w-full border-b border-white/08 bg-[#0f0f11] px-3 py-2 flex items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/05 border border-white/08 text-xs text-zinc-300 w-full">
          <div className="size-4 rounded bg-zinc-700 shrink-0" />
          <span className="truncate">My Server</span>
          <ChevronDown className="size-3 ml-auto text-zinc-500 shrink-0" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-44 shrink-0 border-r border-white/08 bg-[#0f0f11] flex-col py-4">
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
                    item.active ? "bg-white/08 text-foreground" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/05"
                  }`}
                >
                  <div className="size-3.5 shrink-0 bg-zinc-700 rounded-sm" />
                  {item.label}
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
