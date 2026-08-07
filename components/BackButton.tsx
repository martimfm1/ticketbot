"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        try {
          router.back();
        } catch (e) {
          window.location.href = fallback;
        }
      }}
      aria-label="Voltar"
      title="Voltar"
      className="inline-flex items-center cursor-pointer gap-2 px-4 py-3 sm:px-3 sm:py-1.5 rounded-md text-sm bg-zinc-900/60 hover:bg-zinc-900/40 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
    >
      <svg
        aria-hidden
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
        className="-ml-1 w-4 h-4 text-zinc-100"
      >
        <path d="M12 16L6 10l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-medium">Back</span>
    </button>
  );
}
