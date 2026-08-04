"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Documentation", href: "#docs" },
  { label: "GitHub", href: "https://github.com", target: "_blank" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-nav shadow-2xl" : "bg-transparent"
        }`}
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 group"
            aria-label="SILENTRA Ticket home"
          >
            <div className="size-8 rounded-lg bg-foreground/10 border border-border flex items-center justify-center group-hover:bg-foreground/15 transition-colors">
              <Ticket className="size-4 text-foreground" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">
              SILENTRA <span className="text-muted-foreground font-normal">Ticket</span>
            </span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.target}
                  rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-foreground/5"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
            <Button
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90 font-medium"
            >
              Add to Discord
            </Button>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle mobile menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 glass-nav border-t border-border py-4 px-4"
            role="dialog"
            aria-label="Mobile navigation"
          >
            <ul className="flex flex-col gap-1" role="list">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.target}
                    rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
                    className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-foreground/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
              <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                Add to Discord
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
