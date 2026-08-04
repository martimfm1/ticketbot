"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  LayoutDashboard,
  TicketCheck,
  FileText,
  UserCog,
  Globe2,
  BarChart3,
  Server,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Discord OAuth Login",
    description:
      "Secure sign-in via Discord OAuth 2.0. No passwords to manage — just your Discord account.",
  },
  {
    icon: LayoutDashboard,
    title: "Interactive Dashboard",
    description:
      "A clean web interface that surfaces everything your team needs — metrics, tickets, staff — at a glance.",
  },
  {
    icon: TicketCheck,
    title: "Ticket Management",
    description:
      "Create, assign, escalate, and resolve tickets from one place. Never miss an open request again.",
  },
  {
    icon: FileText,
    title: "Transcripts",
    description:
      "Every ticket conversation is archived automatically. Search, export, and audit your support history.",
  },
  {
    icon: UserCog,
    title: "Role Permissions",
    description:
      "Fine-grained access control synced with Discord roles. Staff see only what they should see.",
  },
  {
    icon: Globe2,
    title: "Localization",
    description:
      "Serve multilingual communities. Bot messages and dashboard labels support multiple languages.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Track response times, volume trends, and staff performance over time with built-in charts.",
  },
  {
    icon: Server,
    title: "Multi-Server Support",
    description:
      "Manage multiple Discord servers from a single dashboard. Switch context in one click.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="py-24 px-4 sm:px-6 lg:px-8"
      aria-labelledby="features-heading"
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
            Everything you need
          </p>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight text-balance"
          >
            Built for serious communities.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-pretty">
            From OAuth login to per-server analytics, SILENTRA Ticket is the
            complete support infrastructure for Discord.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((feature) => (
            <motion.article
              key={feature.title}
              variants={cardVariants}
              className="group glass rounded-2xl p-6 hover:bg-white/06 transition-colors duration-200"
            >
              <div className="size-10 rounded-xl bg-white/06 border border-white/08 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                <feature.icon className="size-5 text-foreground" aria-hidden="true" />
              </div>
              <h3 className="font-medium text-foreground mb-2 text-sm">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


