"use client";

import { motion } from "framer-motion";
import { ArrowRight, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="cta-heading">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl glass border border-white/08 px-8 py-20 sm:py-24 text-center overflow-hidden"
        >
          {/* subtle inner glow */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden="true"
          >
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[300px] opacity-25"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(255,255,255,0.07) 0%, transparent 70%)",
              }}
            />
          </div>

          <h2
            id="cta-heading"
            className="text-3xl sm:text-5xl font-semibold text-foreground tracking-tight text-balance max-w-2xl mx-auto"
          >
            Start managing tickets the modern way.
          </h2>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg text-pretty">
            Join hundreds of communities that have already replaced Discord
            chaos with a real support system.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 font-medium gap-2 px-8"
            >
              Add to Discord
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/05 gap-2 px-8"
            >
              <GitBranch className="size-4" data-icon="inline-start" />
              GitHub
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
