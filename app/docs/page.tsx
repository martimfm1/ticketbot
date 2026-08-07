import Link from "next/link";
import BackButton from "@/components/BackButton";

const sections = [
  {
    href: "/docs/getting-started",
    title: "Getting Started",
    description:
      "Install, configure and run SILENTRA Ticket Bot for the first time.",
  },
  {
    href: "/docs/api",
    title: "API Reference",
    description:
      "Explore commands, interactions, ticket controls and database operations.",
  },
  {
    href: "/docs/faq",
    title: "FAQ",
    description:
      "Answers to common questions about installation, configuration and troubleshooting.",
  },
];

export default function DocsIndex() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        <div className="fixed left-6 top-6 z-50">
          <BackButton />
        </div>

        <header className="mb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-500">
            SILENTRA Ticket Bot
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Documentation
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Guides and references to help you install, configure, use and
            troubleshoot SILENTRA Ticket Bot.
          </p>
        </header>

        <section>
          <div className="grid gap-4">
            {sections.map((section, index) => (
              <Link
                key={section.href}
                href={section.href}
                className="group rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900/50"
              >
                <div className="flex items-start gap-5">
                  <span className="pt-0.5 font-mono text-xs text-zinc-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0">
                    <h2 className="text-sm font-medium text-zinc-100 transition-colors group-hover:text-white">
                      {section.title}
                    </h2>

                    <p className="mt-1.5 max-w-xl text-sm leading-6 text-zinc-500">
                      {section.description}
                    </p>
                  </div>

                  <span className="ml-auto pt-0.5 text-zinc-600 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-zinc-300">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-zinc-100">Open source</h2>

              <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">
                SILENTRA Ticket Bot is publicly available on GitHub. Explore the
                source code, report issues or contribute to the project.
              </p>
            </div>

            <a
              href="https://github.com/martimfm1/silentra-ticket"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-sm text-zinc-200 hover:underline"
            >
              View on GitHub →
            </a>
          </div>
        </section>

        <div className="mt-8 border-t border-zinc-800 pt-6">
          <p className="text-sm text-zinc-500">
            SILENTRA Ticket Bot documentation.
          </p>
        </div>
      </div>
    </div>
  );
}
