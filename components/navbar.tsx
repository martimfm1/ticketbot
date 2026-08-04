"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Ticket, LayoutDashboard, Settings, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Documentation", href: "/docs" },
  {
    label: "GitHub",
    href: "https://github.com/martimfm1/silentra-ticket",
    target: "_blank",
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function getAvatarUrl(user: any) {
    if (!user) return "/favicon.ico";
    if (user.image) return user.image; // Suporte NextAuth
    if (user.avatar) {
      const isAnimated = String(user.avatar).startsWith("a_");
      const ext = isAnimated ? "gif" : "png";
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
    }
    const disc = Number(user.discriminator) || 0;
    const idx = disc % 5;
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  }

  // Fetch current user from server endpoint
  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("no user");
        return r.json();
      })
      .then((data) => {
        if (mounted) setUser(data);
      })
      .catch(() => {
        if (mounted) setUser(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleLogout = () => {
    fetch("/api/auth/logout").then(() => (window.location.href = "/"));
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-nav shadow-2xl backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/50" : "bg-transparent"
        }`}
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="SILENTRA Ticket - Home"
          >
            <div className="size-8 rounded-lg bg-foreground/10 border border-border flex items-center justify-center group-hover:bg-foreground/15 transition-colors">
              <Ticket className="size-4 text-foreground" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">
              SILENTRA{" "}
              <span className="text-muted-foreground font-normal">Ticket</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.target}
                  rel={
                    link.target === "_blank" ? "noopener noreferrer" : undefined
                  }
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-foreground/5"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                {/* Sign In - Abre na mesma aba */}
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    Sign In
                  </Button>
                </Link>
                <Button
                  size="sm"
                  onClick={() =>
                    window.open(
                      "https://discord.com/oauth2/authorize?client_id=1303728329689399297&permissions=8&integration_type=0&scope=bot",
                      "_blank"
                    )
                  }
                  className="bg-foreground cursor-pointer text-background hover:bg-foreground/90 font-medium"
                >
                  Add to Discord
                </Button>
              </>
            ) : (
              /* Utilizador Autenticado - Avatar & Dropdown */
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Open user menu"
                  className="flex items-center gap-2 p-1 rounded-full border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                  <img
                    src={getAvatarUrl(user)}
                    alt={user.username || user.name || "User"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-zinc-950 border border-zinc-800/90 rounded-xl shadow-2xl py-1 z-50 overflow-hidden"
                    >
                      {/* Estado: Logou */}
                      <div className="px-3.5 py-2.5 border-b border-zinc-800/60 bg-zinc-900/40">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Logou</span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-200 truncate mt-0.5">
                          {user.username || user.name || "Utilizador"}
                        </p>
                      </div>

                      {/* Links do Menu */}
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          href="/settings"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Definições</span>
                        </Link>
                      </div>

                      {/* Terminar Sessão */}
                      <div className="pt-1 border-t border-zinc-800/60">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle mobile menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
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
            className="fixed top-16 left-0 right-0 z-40 bg-zinc-950 border-t border-zinc-800/80 py-4 px-4"
            role="dialog"
            aria-label="Mobile navigation"
          >
            <ul className="flex flex-col gap-1" role="list">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.target}
                    rel={
                      link.target === "_blank"
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-foreground/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-zinc-800/60">
              {!user ? (
                <>
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Button
                    className="w-full bg-foreground text-background hover:bg-foreground/90"
                    onClick={() =>
                      window.open(
                        "https://discord.com/oauth2/authorize?client_id=1303728329689399297&permissions=8&integration_type=0&scope=bot",
                        "_blank"
                      )
                    }
                  >
                    Add to Discord
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <img
                      src={getAvatarUrl(user)}
                      alt={user.username || user.name || "User"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Logou
                      </span>
                      <span className="text-xs text-zinc-200 font-semibold truncate">
                        {user.username || user.name}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-200"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-200"
                  >
                    <Settings className="w-4 h-4" />
                    Definições
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}