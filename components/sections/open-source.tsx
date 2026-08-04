"use client";

import { motion } from "framer-motion";
import { Star, GitFork, Users, Scale, Heart } from "lucide-react";
import { GithubIcon } from "@/components/github-icon";
import { Button } from "@/components/ui/button";

export function OpenSource() {
  return (
    <section id="github" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Open Source
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Built in the open
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            SILENTRA Ticket is and always will be open source. Community-driven,
            MIT licensed, and open to contributions from everyone.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-12 max-w-2xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] p-8">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/[0.03] blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/8 bg-white/5">
                  <GithubIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    silentra/ticket
                  </h3>
                  <p className="text-sm text-zinc-400">
                    The open-source Discord ticket management platform
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="lg" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon className="h-4 w-4" />
                  View on GitHub
                </a>
              </Button>
            </div>

            <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Star, label: "Stars", value: "4.2K" },
                { icon: GitFork, label: "Forks", value: "380+" },
                { icon: Users, label: "Contributors", value: "47" },
                { icon: Scale, label: "License", value: "MIT" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/8 bg-white/[0.02] p-4 text-center"
                >
                  <stat.icon className="mx-auto mb-2 h-4 w-4 text-zinc-500" />
                  <div className="text-lg font-semibold text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-zinc-500">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="relative mt-6 flex flex-wrap items-center gap-4 border-t border-white/8 pt-6 text-sm text-zinc-400">
              <span className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-zinc-500" />
                MIT License
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-zinc-500" />
                Community Driven
              </span>
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-zinc-500" />
                Open Contributions
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
