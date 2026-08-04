import { Ticket } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const links = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Dashboard", href: "#dashboard" },
    { label: "Analytics", href: "#features" },
    { label: "Pricing", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#docs" },
    { label: "GitHub", href: "https://github.com", target: "_blank" },
    { label: "Changelog", href: "#" },
    { label: "Status", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
  Community: [
    { label: "Discord Server", href: "#", target: "_blank" },
    { label: "Twitter", href: "#", target: "_blank" },
    { label: "Contribute", href: "https://github.com", target: "_blank" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/08 py-16 px-4 sm:px-6 lg:px-8" role="contentinfo">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Brand */}
          <div className="lg:w-64 shrink-0">
            <a
              href="/"
              className="flex items-center gap-2 mb-4"
              aria-label="SILENTRA Ticket home"
            >
              <div className="size-8 rounded-lg bg-foreground/10 border border-border flex items-center justify-center">
                <Ticket className="size-4 text-foreground" />
              </div>
              <span className="font-semibold text-foreground tracking-tight">
                SILENTRA{" "}
                <span className="text-muted-foreground font-normal">Ticket</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs text-pretty">
              Professional Discord ticket management. Built for communities
              that care about support quality.
            </p>
          </div>

          {/* Nav columns */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(links).map(([section, items]) => (
              <div key={section}>
                <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-4">
                  {section}
                </p>
                <ul className="flex flex-col gap-3" role="list">
                  {items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target={(item as { target?: string }).target}
                        rel={
                          (item as { target?: string }).target === "_blank"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-10 bg-white/08" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SILENTRA. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Open source under the{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              MIT License
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
