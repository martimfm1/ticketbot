"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Ticket, LayoutDashboard, Settings, LogOut, CheckCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Documentation", href: "/docs" },
  { label: "GitHub", href: "https://github.com/martimfm1/silentra-ticket", target: "_blank" },
];

interface CurrentUser {
  id: string;
  name?: string | null;
  username?: string | null;
  image?: string | null;
  avatar?: string | null;
  discriminator?: string | number | null;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("No authenticated user");
        return response.json();
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
    function onClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setMobileOpen(false);
      }
    }

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function getAvatarUrl(currentUser: CurrentUser | null) {
    if (!currentUser) return "/favicon.ico";
    if (currentUser.image) return currentUser.image;
    if (currentUser.avatar) {
      const isAnimated = String(currentUser.avatar).startsWith("a_");
      const ext = isAnimated ? "gif" : "png";
      return `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.${ext}?size=128`;
    }
    const disc = Number(currentUser.discriminator) || 0;
    return `https://cdn.discordapp.com/embed/avatars/${disc % 5}.png`;
  }

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <>
      <header className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${scrolled ? "glass-nav shadow-2xl backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/50" : "bg-transparent"}`}>
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <Link href="/" className="group flex items-center gap-2" aria-label="SILENTRA Ticket home">
            <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-foreground/10 transition-colors group-hover:bg-foreground/15">
              <Ticket className="size-4 text-foreground" aria-hidden="true" />
            </div>
            <span className="font-semibold tracking-tight text-foreground">SILENTRA <span className="font-normal text-muted-foreground">Ticket</span></span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex" role="list">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.target}
                  rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            {!user ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="cursor-pointer text-muted-foreground hover:text-foreground">Sign in</Button>
                </Link>
                <Button
                  size="sm"
                  onClick={() => window.open("https://discord.com/oauth2/authorize?client_id=1303728329689399297&permissions=8&integration_type=0&scope=bot", "_blank", "noopener,noreferrer")}
                  className="cursor-pointer bg-foreground font-medium text-background hover:bg-foreground/90"
                >
                  Add to Discord
                </Button>
              </>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  aria-label="Open user menu"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-full border border-zinc-800 p-1 transition-all hover:border-zinc-700 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                  <img src={getAvatarUrl(user)} alt="" className="size-8 rounded-full object-cover" />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950 py-1 shadow-2xl"
                      role="menu"
                    >
                      <div className="border-b border-zinc-800/60 bg-zinc-900/40 px-3.5 py-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                          <span>Signed in</span>
                        </div>
                        <p className="mt-0.5 truncate text-xs font-semibold text-zinc-200">{user.username || user.name || "User"}</p>
                      </div>

                      <div className="py-1">
                        <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100 focus-visible:outline-none focus-visible:bg-zinc-900" role="menuitem">
                          <LayoutDashboard className="size-3.5 text-zinc-400" aria-hidden="true" /> Dashboard
                        </Link>
                        <Link href="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100 focus-visible:outline-none focus-visible:bg-zinc-900" role="menuitem">
                          <Settings className="size-3.5 text-zinc-400" aria-hidden="true" /> Settings
                        </Link>
                      </div>

                      <div className="border-t border-zinc-800/60 pt-1">
                        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:bg-red-500/10" role="menuitem">
                          <LogOut className="size-3.5" aria-hidden="true" /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 md:hidden"
            aria-label={mobileOpen ? "Close mobile menu" : "Open mobile menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 right-0 top-16 z-40 border-t border-zinc-800/80 bg-zinc-950 px-4 py-4"
            aria-label="Mobile navigation"
          >
            <ul className="flex flex-col gap-1" role="list">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target={link.target} rel={link.target === "_blank" ? "noopener noreferrer" : undefined} className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400" onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-2 border-t border-zinc-800/60 pt-4">
              {!user ? (
                <>
                  <Link href="/login" className="w-full" onClick={() => setMobileOpen(false)}><Button variant="outline" className="w-full">Sign in</Button></Link>
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90" onClick={() => window.open("https://discord.com/oauth2/authorize?client_id=1303728329689399297&permissions=8&integration_type=0&scope=bot", "_blank", "noopener,noreferrer")}>Add to Discord</Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                    <img src={getAvatarUrl(user)} alt="" className="size-8 rounded-full object-cover" />
                    <div className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400"><CheckCircle2 className="size-3" aria-hidden="true" /> Signed in</span>
                      <span className="truncate text-xs font-semibold text-zinc-200">{user.username || user.name || "User"}</span>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"><LayoutDashboard className="size-4" aria-hidden="true" /> Dashboard</Link>
                  <Link href="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"><Settings className="size-4" aria-hidden="true" /> Settings</Link>
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-left text-sm text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"><LogOut className="size-4" aria-hidden="true" /> Sign out</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
