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
    <section>
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="text-sm font-medium text-muted-foreground">
            What people say
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Trusted by real communities.
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.blockquote
              key={testimonial.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: index * 0.07,
              }}
              className="glass flex h-full min-h-[220px] flex-col rounded-2xl p-6 transition-colors duration-200 hover:bg-white/[0.06]"
            >
              {/* Quote */}
              <p className="text-sm leading-relaxed text-muted-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <footer className="mt-auto flex items-center gap-3 pt-8">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/8 bg-zinc-700 text-xs font-semibold text-zinc-300"
                  aria-hidden="true"
                >
                  {testimonial.initials}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {testimonial.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
