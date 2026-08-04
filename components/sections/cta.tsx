"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/github-icon";

export function CTA() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#0d0d0f] px-6 py-20 text-center"
        >
          {/* Background effects */}
          <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_40%,transparent_100%)]" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-[100px]" />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Start managing tickets
              <br />
              the modern way
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-zinc-400">
              Join thousands of communities already using SILENTRA Ticket to
              deliver professional support.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Add to Discord
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon className="h-4 w-4" />
                  Star on GitHub
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
