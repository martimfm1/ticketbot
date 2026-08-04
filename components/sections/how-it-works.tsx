"use client";

import { motion } from "framer-motion";
import { UserPlus, Link2, LayoutDashboard, ArrowDown } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Invite the bot",
    description:
      "Add SILENTRA Ticket to your Discord server with a single click. No complex setup required.",
  },
  {
    icon: Link2,
    title: "Connect your server",
    description:
      "Authenticate through Discord OAuth and link your server to the dashboard. Everything syncs automatically.",
  },
  {
    icon: LayoutDashboard,
    title: "Manage everything",
    description:
      "Create ticket panels, assign staff, track analytics, and manage all your support from one place.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Up and running in minutes
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            Three simple steps from installation to a fully managed support system.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative rounded-2xl border border-white/8 bg-white/[0.02] p-6 transition-all hover:border-white/15 hover:bg-white/[0.04]"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-white">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-semibold text-white/10">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {step.description}
                </p>
              </motion.div>

              {i < steps.length - 1 && (
                <div className="my-2 flex justify-center lg:hidden">
                  <ArrowDown className="h-5 w-5 text-zinc-700" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
