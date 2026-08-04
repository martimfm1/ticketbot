"use client";

import { motion } from "framer-motion";
import { GitBranch, Star, GitFork, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const highlights = [
  {
    icon: BookOpen,
    title: "MIT License",
    description: "Use, modify, and distribute freely. No vendor lock-in.",
  },
  {
    icon: GitBranch,
    title: "Community Driven",
    description: "Shaped by real Discord communities. Your feedback ships.",
  },
  {
    icon: GitFork,
    title: "Open Contributions",
    description: "Fork it, improve it, open a PR. All contributions welcome.",
  },
];

export function OpenSourceSection() {
  return (
    <section
      className="py-24 px-4 sm:px-6 lg:px-8"
      aria-labelledby="oss-heading"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-8 sm:p-12 border border-white/08"
        >
          <div className="flex flex-col lg:flex-row gap-12 lg:items-center">
            {/* Left */}
            <div className="flex-1">
              <Badge
                variant="outline"
                className="mb-6 border-white/10 text-muted-foreground bg-white/04 text-xs px-3 py-1"
              >
                Open Source
              </Badge>
              <h2
                id="oss-heading"
                className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight text-balance"
              >
                Transparent by design.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed max-w-md text-pretty">
                SILENTRA Ticket is fully open source. Inspect the code, audit
                the security, contribute features — the entire project lives on
                GitHub.
              </p>

              {/* GitHub card */}
              <div className="mt-8 inline-flex items-center gap-4 rounded-xl glass border border-white/08 px-5 py-4">
                <GitBranch className="size-8 text-foreground shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-foreground">silentra/ticket</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    discord ticket management system
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/08">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="size-3" aria-hidden="true" />
                    1.2k
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <GitFork className="size-3" aria-hidden="true" />
                    184
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/05 gap-2"
                >
                  <GitBranch className="size-4" data-icon="inline-start" />
                  View on GitHub
                </Button>
              </div>
            </div>

            {/* Right — highlights */}
            <div className="flex flex-col gap-4 lg:w-72">
              {highlights.map((h, i) => (
                <motion.div
                  key={h.title}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-4 rounded-xl bg-white/03 border border-white/08 px-4 py-4"
                >
                  <div className="size-8 rounded-lg bg-white/06 border border-white/08 flex items-center justify-center shrink-0">
                    <h.icon className="size-4 text-foreground" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{h.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {h.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
