"use client";

export default function Stats() {
  const stats = [
    { label: "Open Tickets", value: "24", delta: "+3", up: true },
    { label: "Resolved Today", value: "58", delta: "+12", up: true },
    { label: "Avg. Response", value: "4m", delta: "-1m", up: true },
    { label: "Active Staff", value: "7", delta: "0", up: null },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl p-3 border border-white/08" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
          <div className="flex items-end justify-between">
            <span className="text-xl font-semibold text-foreground">{s.value}</span>
            {s.up !== null && <span className="text-xs text-zinc-400 flex items-center gap-0.5">{s.delta}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
