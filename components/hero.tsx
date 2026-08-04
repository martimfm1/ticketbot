"use client";

import { motion } from "framer-motion";
import { ArrowRight, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardPreview } from "@/components/dashboard-preview";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

export function Hero() {
  return (
    <section
      className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[500px] opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center gap-16">
          {/* Left — copy */}
          <div className="flex-1 max-w-xl">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <Badge
                variant="outline"
                className="mb-6 border-white/10 text-muted-foreground bg-white/04 text-xs px-3 py-1"
              >
                Open Source · MIT License
              </Badge>
            </motion.div>

            <motion.h1
              id="hero-heading"
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.08] tracking-tight text-balance"
            >
              Manage Discord Support{" "}
              <span className="text-muted-foreground">Professionally.</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty"
            >
              SILENTRA Ticket replaces scattered Discord commands with a modern
              web dashboard — giving your community a professional support
              experience and your team real visibility.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 font-medium gap-2"
              >
                Add to Discord
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/05 gap-2"
              >
                <GitBranch className="size-4" data-icon="inline-start" />
                Open Dashboard
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-10 flex items-center gap-5"
            >
              <div className="flex -space-x-2">
                {["Z","K","R","A","M"].map((l) => (
                  <div
                    key={l}
                    className="size-7 rounded-full bg-zinc-700 border-2 border-background flex items-center justify-center text-[10px] font-semibold text-zinc-300"
                  >
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Trusted by <span className="text-foreground">500+</span> Discord communities
              </p>
            </motion.div>
          </div>

          {/* Right — dashboard preview */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex-1 min-w-0 w-full lg:max-w-2xl"
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
