"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/sections/dashboard-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]" />
      <div className="absolute inset-0 bg-radial-fade" />
      <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-white/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: content */}
          <div className="flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400 backdrop-blur-xl"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-400" />
              Now in open beta
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-500">v2.4</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Manage Discord
              <br />
              support{" "}
              <span className="text-gradient">professionally.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg"
            >
              SILENTRA Ticket lets communities manage support tickets through a
              modern web dashboard instead of relying on clunky Discord commands.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Button size="lg" asChild>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Add to Discord
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <a href="#dashboard">
                  Open Dashboard
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex items-center gap-4 text-xs text-zinc-600"
            >
              <span>MIT Licensed</span>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span>Open Source</span>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span>Self-hostable</span>
            </motion.div>
          </div>

          {/* Right: dashboard preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative"
            id="dashboard"
          >
            {/* Glow behind dashboard */}
            <div className="absolute -inset-4 rounded-3xl bg-white/[0.03] blur-2xl" />
            <div className="relative">
              <DashboardPreview />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
