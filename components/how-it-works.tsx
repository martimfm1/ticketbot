"use client";

import { motion } from "framer-motion";
import { PlusCircle, Link2, Gauge } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: PlusCircle,
    title: "Invite the bot",
    description:
      "Add SILENTRA Ticket to your Discord server with a single click. Full permissions are configured automatically.",
  },
  {
    number: "2",
    icon: Link2,
    title: "Connect your server",
    description:
      "Sign in to the web dashboard with Discord OAuth and link your server in seconds. No configuration files.",
  },
  {
    number: "3",
    icon: Gauge,
    title: "Manage everything",
    description:
      "Create ticket panels, assign staff, track metrics, and resolve support requests — all from the dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section
      className="py-24 px-4 sm:px-6 lg:px-8"
      aria-labelledby="how-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-4">
            Simple setup
          </p>
          <h2
            id="how-heading"
            className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight"
          >
            Up and running in minutes.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-pretty">
            Getting started with SILENTRA Ticket takes less time than writing
            a support message.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div
            className="hidden lg:block absolute top-8 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex flex-col items-center text-center"
              >
                {/* Icon circle */}
                <div className="relative mb-6">
                  <div className="size-16 rounded-2xl glass border border-white/08 flex items-center justify-center">
                    <step.icon className="size-7 text-foreground" aria-hidden="true" />
                  </div>
                  <span className="absolute -top-2 -right-2 size-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs text-pretty">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
