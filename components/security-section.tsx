"use client";

import { motion } from "framer-motion";
import { LockKeyhole, ShieldCheck, KeyRound, Zap } from "lucide-react";

const pillars = [
  {
    icon: LockKeyhole,
    title: "Encrypted at rest & in transit",
    description:
      "All data is encrypted using AES-256 at rest. Every connection uses TLS 1.3 so nothing leaves unprotected.",
  },
  {
    icon: ShieldCheck,
    title: "Secure authentication",
    description:
      "Login is handled exclusively via Discord OAuth 2.0. We never store passwords or tokens beyond your session.",
  },
  {
    icon: KeyRound,
    title: "Role-based access",
    description:
      "Permissions mirror your Discord server roles. Staff members see only the tickets and data they are authorised for.",
  },
  {
    icon: Zap,
    title: "Reliable infrastructure",
    description:
      "Deployed on globally distributed edge infrastructure with automated failover and 99.9% uptime SLA.",
  },
];

export function SecuritySection() {
  return (
    <section
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      aria-labelledby="security-heading"
    >
      {/* subtle background accent */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(255,255,255,0.01)" }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 lg:items-start">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:w-80 shrink-0"
          >
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-4">
              Security first
            </p>
            <h2
              id="security-heading"
              className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight text-balance"
            >
              Built for trust.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-pretty">
              Your community data deserves the same protections as an
              enterprise product. SILENTRA Ticket ships with security defaults
              that most tools charge extra for.
            </p>
          </motion.div>

          {/* Right — pillars */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass rounded-2xl p-6 hover:bg-white/06 transition-colors duration-200"
              >
                <div className="size-10 rounded-xl bg-white/06 border border-white/08 flex items-center justify-center mb-4">
                  <p.icon className="size-5 text-foreground" aria-hidden="true" />
                </div>
                <h3 className="font-medium text-foreground mb-2 text-sm">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
