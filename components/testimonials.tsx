"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Switched from every other ticket bot and never looked back. The dashboard alone saves our moderation team an hour a day.",
    name: "Alex W.",
    role: "Server Owner · 12k members",
    initials: "AW",
  },
  {
    quote:
      "Finally a ticket tool that feels like software, not a Discord bot cobbled together. The analytics are genuinely useful.",
    name: "Kate M.",
    role: "Community Manager",
    initials: "KM",
  },
  {
    quote:
      "The role-based permissions are the killer feature for us. Staff can only see their own tickets and nothing sensitive leaks.",
    name: "Raj D.",
    role: "Staff Lead · Gaming Community",
    initials: "RD",
  },
  {
    quote:
      "Setup took under five minutes. The transcript system has already saved us from several disputes.",
    name: "Mia F.",
    role: "Server Admin",
    initials: "MF",
  },
  {
    quote:
      "We manage 8 servers with a single dashboard. Multi-server support is a game changer for our network.",
    name: "Jordan T.",
    role: "Network Owner",
    initials: "JT",
  },
  {
    quote:
      "Open source and actively maintained. I can see the code, trust the security, and contribute improvements.",
    name: "Chris L.",
    role: "Developer",
    initials: "CL",
  },
];

export function Testimonials() {
  return (
    <section
      className="py-24 px-4 sm:px-6 lg:px-8"
      aria-labelledby="testimonials-heading"
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
            What people say
          </p>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight"
          >
            Trusted by real communities.
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="glass rounded-2xl p-6 break-inside-avoid hover:bg-white/06 transition-colors duration-200"
            >
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="flex items-center gap-3">
                <div
                  className="size-8 rounded-full bg-zinc-700 border border-white/08 flex items-center justify-center text-xs font-semibold text-zinc-300 shrink-0"
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
