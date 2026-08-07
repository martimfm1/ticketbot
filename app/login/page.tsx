"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Loader2, Bot } from "lucide-react";
import { signIn } from "next-auth/react";
import BackButton from "@/components/BackButton";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 127.14 96.36"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.68 1.76 1.36 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.91-72.14zM42.45 65.69c-6.23 0-11.37-5.71-11.37-12.72s5.01-12.72 11.37-12.72c6.41 0 11.5 5.76 11.37 12.72 0 7.01-4.96 12.72-11.37 12.72zm42.24 0c-6.23 0-11.37-5.71-11.37-12.72s5.01-12.72 11.37-12.72c6.42 0 11.5 5.76 11.37 12.72 0 7.01-4.96 12.72-11.37 12.72z" />
    </svg>
  );
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDiscordLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("discord", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Login flow failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-6 text-zinc-100 selection:bg-zinc-800 selection:text-zinc-100 sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035)_0,transparent_65%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="mb-6 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
              <Bot className="size-4 text-zinc-300" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-200">SILENTRA</span>
          </div>
          <span className="rounded-md border border-zinc-800/80 bg-zinc-900/80 px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Tickets
          </span>
        </div>

        <section className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 shadow-2xl shadow-black/80 backdrop-blur-xl sm:p-8" aria-labelledby="login-heading">
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" aria-hidden="true" />

          <div className="mb-8 space-y-1.5">
            <h1 id="login-heading" className="mb-3 text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
              Sign in
            </h1>
            <p className="mb-4 text-sm leading-relaxed text-zinc-400">
              Sign in with your Discord account to access your dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleDiscordLogin}
              disabled={isLoading}
              aria-busy={isLoading}
              className="group flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-zinc-100 px-5 py-4 text-base font-medium text-zinc-950 shadow-sm transition-all duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 sm:py-3.5 sm:text-sm"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin text-zinc-950" aria-hidden="true" />
              ) : (
                <DiscordIcon className="size-4 text-zinc-950 transition-transform group-hover:scale-105" />
              )}
              <span>{isLoading ? "Redirecting…" : "Continue with Discord"}</span>
              {!isLoading && <ArrowRight className="ml-auto size-4 text-zinc-500 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-950" aria-hidden="true" />}
            </button>

            <div className="flex items-start gap-2.5 rounded-lg border border-zinc-800/50 bg-zinc-950/50 px-3 py-2.5 text-[12px] text-zinc-400" role="note">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-zinc-400" aria-hidden="true" />
              <span className="leading-snug">Secure OAuth 2.0 sign-in. SILENTRA does not request access to your private Discord messages.</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-zinc-800/60 pt-6 text-[12px] text-zinc-500">
            <a href="/docs" className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 hover:text-zinc-300">
              Documentation
            </a>
            <span className="text-zinc-800" aria-hidden="true">•</span>
            <a href="https://github.com/martimfm1/ticketbot" target="_blank" rel="noopener noreferrer" className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 hover:text-zinc-300">
              Source code
            </a>
          </div>
        </section>

        <p className="mt-6 text-center text-[11px] tracking-wide text-zinc-600">SILENTRA Ticket Bot</p>
      </motion.div>
    </main>
  );
}
