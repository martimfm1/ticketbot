"use client";

import React, { useState, useEffect } from "react";
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
    >
      <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.68 1.76 1.36 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.91-72.14zM42.45 65.69c-6.23 0-11.37-5.71-11.37-12.72s5.01-12.72 11.37-12.72c6.41 0 11.5 5.76 11.37 12.72 0 7.01-4.96 12.72-11.37 12.72zm42.24 0c-6.23 0-11.37-5.71-11.37-12.72s5.01-12.72 11.37-12.72c6.42 0 11.5 5.76 11.37 12.72 0 7.01-4.96 12.72-11.37 12.72z" />
    </svg>
  );
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  // Evita Hydration Mismatch no ano do rodapé
  useEffect(() => {
          setYear(new Date().getFullYear());
  }, []);

  const handleDiscordLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("discord", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Erro no fluxo de login:", error);
      setIsLoading(false);
    }
  };

        return (
          <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 sm:p-8 relative overflow-hidden selection:bg-zinc-800 selection:text-zinc-100">
      {/* Luz ambiente */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035)_0,transparent_65%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Grid de fundo */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] relative z-10"
      >
        <div className="mb-4">
          <BackButton />
        </div>

        {/* Header da Marca */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Bot className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-200">
              Silentra
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest px-2 py-0.5 rounded-md bg-zinc-900/80 border border-zinc-800/80">
            Tickets
          </span>
        </div>

        {/* Card Principal */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />

          <div className="space-y-1.5 mb-8">
                  <h1 className="text-lg sm:text-xl font-semibold mb-3 tracking-tight text-zinc-100">
              Iniciar sessão
            </h1>
                  <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                    Sign in with your Discord account to access your dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleDiscordLogin}
              disabled={isLoading}
              className="w-full group relative flex items-center justify-center gap-3 px-5 py-4 sm:py-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-base sm:text-sm transition-all duration-200 shadow-sm active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              aria-label="Autenticar com a conta Discord"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
              ) : (
                <DiscordIcon className="w-4 h-4 text-zinc-950 transition-transform group-hover:scale-105" />
              )}

              <span>
                {isLoading ? "A redirecionar..." : "Continuar com Discord"}
              </span>

              {!isLoading && (
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-950 group-hover:translate-x-0.5 transition-all ml-auto" />
              )}
            </button>

            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-zinc-950/50 border border-zinc-800/50 text-[12px] text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className="leading-snug">
                OAuth2 seguro. Sem acesso a dados sensíveis.
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800/60 flex items-center justify-between text-[12px] text-zinc-500">
            <a
              href="/termos"
              className="hover:text-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded"
            >
              Termos
            </a>
            <span className="text-zinc-800">•</span>
            <a
              href="/privacidade"
              className="hover:text-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded"
            >
              Privacidade
            </a>
            <span className="text-zinc-800">•</span>
            <a
              href="/documentacao"
              className="hover:text-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded"
            >
              Docs
            </a>
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-600 mt-6 tracking-wide">
          Silentra Ticket Bot &copy; {year ?? "2026"}
        </p>
      </motion.div>
    </main>
  );
}