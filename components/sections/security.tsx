"use client";

import { motion } from "framer-motion";
import { Lock, KeyRound, ShieldCheck, ServerCog } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "Encrypted Data",
    description:
      "All data is encrypted in transit with TLS and at rest with AES-256. Your conversations and transcripts are always protected.",
  },
  {
    icon: KeyRound,
    title: "Secure Authentication",
    description:
      "Discord OAuth 2.0 handles all authentication. We never store passwords — your Discord identity is your login.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Permissions",
    description:
      "Granular access control lets you define exactly who can view, manage, and resolve tickets across your entire team.",
  },
  {
    icon: ServerCog,
    title: "Reliable Infrastructure",
    description:
      "Built on enterprise-grade infrastructure with 99.9% uptime. Self-host on your own servers or use our managed cloud.",
  },
];

export function Security() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              Security
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Built with security
              <br />
              at the core
            </h2>
            <p className="mt-4 max-w-md text-base text-zinc-400">
              We take your data and your community's trust seriously. Every
              layer of SILENTRA Ticket is designed with security as a first
              priority, not an afterthought.
            </p>

            <div className="mt-8 flex items-center gap-6">
              <div>
                <div className="text-2xl font-semibold text-white">99.9%</div>
                <div className="text-xs text-zinc-500">Uptime SLA</div>
              </div>
              <div className="h-10 w-px bg-white/8" />
              <div>
                <div className="text-2xl font-semibold text-white">AES-256</div>
                <div className="text-xs text-zinc-500">Encryption</div>
              </div>
              <div className="h-10 w-px bg-white/8" />
              <div>
                <div className="text-2xl font-semibold text-white">SOC 2</div>
                <div className="text-xs text-zinc-500">Compliance</div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2">
            {securityFeatures.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: (i % 2) * 0.1 }}
                className="rounded-xl border border-white/8 bg-white/[0.02] p-5 transition-all hover:border-white/15 hover:bg-white/[0.04]"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white">
                  <item.icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
