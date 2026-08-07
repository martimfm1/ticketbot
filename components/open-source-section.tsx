"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Star, GitFork, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

const highlights = [
  {
    icon: BookOpen,
    title: "MIT License",
    description: "Use, modify, and distribute freely. No vendor lock-in.",
  },
  {
    icon: GitBranch,
    title: "Community Driven",
    description: "Shaped by real Discord communities. Your feedback ships.",
  },
  {
    icon: GitFork,
    title: "Open Contributions",
    description: "Fork it, improve it, open a PR. All contributions welcome.",
  },
];

interface GitHubRepository {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  language: string | null;
  license: string | null;
  htmlUrl: string;
}

function formatNumber(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(".0", "")}k`;
  }

  return value.toString();
}

export function OpenSourceSection() {
  const [repository, setRepository] = useState<GitHubRepository | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRepository() {
      try {
        const response = await fetch("/api/github/repository");

        if (!response.ok) {
          throw new Error("Failed to fetch repository");
        }

        const data: GitHubRepository = await response.json();

        if (!cancelled) {
          setRepository(data);
        }
      } catch {
        if (!cancelled) {
          setRepository(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRepository();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl border border-white/8 p-8 sm:p-12"
        >
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            {/* Left */}
            <div className="min-w-0 flex-1">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Open Source
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Transparent by design.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                SILENTRA Ticket is fully open source. Inspect the code, audit
                the security, contribute features — the entire project lives on
                GitHub.
              </p>
              {/* GitHub card */}{" "}
              <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/8 glass px-4 py-3">
                {" "}
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.04]">
                  {" "}
                  <GitBranch
                    className="size-4 text-foreground"
                    aria-hidden="true"
                  />{" "}
                </div>{" "}
                <p className="text-sm font-medium text-foreground">
                  {" "}
                  {repository?.fullName ?? "martimfm1/silentra-ticket"}{" "}
                </p>{" "}
                <div className="ml-2 flex items-center gap-3 border-l border-white/8 pl-3">
                  {" "}
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {" "}
                    <Star className="size-3" aria-hidden="true" />{" "}
                    {loading ? "—" : formatNumber(repository?.stars ?? 0)}{" "}
                  </span>{" "}
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {" "}
                    <GitFork className="size-3" aria-hidden="true" />{" "}
                    {loading ? "—" : formatNumber(repository?.forks ?? 0)}{" "}
                  </span>{" "}
                </div>{" "}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="gap-2 border-white/10 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  <a
                    href={
                      repository?.htmlUrl ??
                      "https://github.com/martimfm1/silentra-ticket"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GitBranch className="size-4" aria-hidden="true" />
                    View on GitHub
                  </a>
                </Button>
              </div>
            </div>

            {/* Right — highlights */}
            <div className="flex flex-col gap-4 lg:w-72">
              {highlights.map((highlight, index) => (
                <motion.div
                  key={highlight.title}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                  }}
                  className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.06]">
                    <highlight.icon
                      className="size-4 text-foreground"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {highlight.title}
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {highlight.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
