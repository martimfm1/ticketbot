import { Logo } from "@/components/logo";

const footerLinks = {
  Product: ["Features", "Dashboard", "Pricing", "Changelog"],
  Documentation: ["Getting Started", "API Reference", "Guides", "FAQ"],
  Resources: ["GitHub", "Discord", "Blog", "Status"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Licenses"],
};

export function Footer() {
  return (
    <footer className="relative border-t border-white/8 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-zinc-500">
              The professional Discord ticket management platform for modern
              communities.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-white">{category}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-zinc-500 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} SILENTRA Ticket. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <a href="#" className="transition-colors hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
