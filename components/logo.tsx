import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6.5L7 4h10l3 2.5v11L17 20H7l-3-2.5v-11z"
            stroke="#09090b"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M9 10h6M9 14h4"
            stroke="#09090b"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight text-white">
          SILENTRA
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          Ticket
        </span>
      </div>
    </div>
  );
}
