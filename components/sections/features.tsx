"use client";

import {
  KeyRound,
  LayoutDashboard,
  Ticket,
  FileText,
  ShieldCheck,
  Languages,
  BarChart3,
  Server,
} from "lucide-react";
import { motion } from "framer-motion";
import { features } from "@/lib/data";

const iconMap = {
  KeyRound,
  LayoutDashboard,
  Ticket,
  FileText,
  ShieldCheck,
  Languages,
  BarChart3,
  Server,
};

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Features
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything you need to run
            <br />
            professional support
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            A complete toolkit for managing Discord support tickets, built for
            teams that take their communities seriously.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                className="group relative rounded-xl border border-white/8 bg-white/[0.02] p-5 transition-all hover:border-white/15 hover:bg-white/[0.04]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white transition-colors group-hover:bg-white group-hover:text-zinc-950">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
