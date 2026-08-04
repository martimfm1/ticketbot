"use client";

export default function ActivityGraph() {
  const activityData = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88];

  return (
    <div className="rounded-xl p-3 border border-white/08 mb-4" style={{ background: "rgba(255,255,255,0.03)" }}>
      <p className="text-xs text-zinc-500 mb-3">Ticket Activity (24h)</p>
      <div className="flex items-end gap-1 h-24 md:h-12">
        {activityData.map((v, i) => (
          <div key={i} className="flex-1 rounded-sm bg-zinc-700 hover:bg-zinc-500 transition-colors" style={{ height: `${v}%` }} />
        ))}
      </div>
    </div>
  );
}
