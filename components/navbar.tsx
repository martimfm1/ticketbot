"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Ticket, LayoutDashboard, Settings, LogOut, CheckCircle2, CreditCard } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Documentation", href: "/docs" },
  { label: "GitHub", href: "https://github.com/martimfm1/silentra-ticket", target: "_blank" },
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

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((response) => { if (!response.ok) throw new Error("no user"); return response.json(); })
      .then((data) => { if (mounted) setUser(data); })
      .catch(() => { if (mounted) setUser(null); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function avatar(userData: any) {
    if (!userData) return "/favicon.ico";
    if (userData.image) return userData.image;
    if (userData.avatar) return `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.${String(userData.avatar).startsWith("a_") ? "gif" : "png"}?size=128`;
    return `https://cdn.discordapp.com/embed/avatars/${Number(userData.discriminator || 0) % 5}.png`;
  }

  return <>
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/8 bg-[#050505]/80 shadow-2xl backdrop-blur-xl" : "bg-transparent"}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="SILENTRA Ticket - Home"><div className="flex size-8 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] transition group-hover:bg-white/[0.08]"><Ticket className="size-4" /></div><span className="font-semibold tracking-tight text-white">SILENTRA <span className="font-normal text-zinc-500">Ticket</span></span></Link>
        <ul className="hidden items-center gap-1 md:flex" role="list">{navLinks.map((link) => <li key={link.label}><a href={link.href} target={link.target} rel={link.target === "_blank" ? "noopener noreferrer" : undefined} className="rounded-lg px-3 py-2 text-sm text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200">{link.label}</a></li>)}</ul>
        <div className="hidden items-center gap-2 md:flex">{!user ? <><Link href="/login"><Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">Entrar</Button></Link><Link href="/pricing"><Button size="sm" className="bg-emerald-400 font-semibold text-zinc-950 hover:bg-emerald-300">Ver planos</Button></Link></> : <div className="relative" ref={menuRef}><button type="button" onClick={() => setMenuOpen((value) => !value)} className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] p-1 transition hover:bg-white/[0.06]" aria-label="Abrir menu do utilizador"><img src={avatar(user)} alt={user.username || user.name || "User"} className="size-8 rounded-full object-cover" /></button><AnimatePresence>{menuOpen ? <motion.div initial={{ opacity: 0, y: 6, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: .97 }} className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/8 bg-zinc-950 shadow-2xl"><div className="border-b border-white/6 bg-white/[0.025] px-4 py-3"><div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300"><CheckCircle2 className="size-3" /> Connected</div><p className="mt-1 truncate text-xs font-semibold text-white">{user.username || user.name || "Utilizador"}</p></div><div className="p-1"><Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-zinc-300 hover:bg-white/[0.05] hover:text-white"><LayoutDashboard className="size-4" /> Dashboard</Link><Link href="/pricing" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-zinc-300 hover:bg-white/[0.05] hover:text-white"><CreditCard className="size-4" /> Planos</Link><Link href="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-zinc-300 hover:bg-white/[0.05] hover:text-white"><Settings className="size-4" /> Definições</Link></div><div className="border-t border-white/6 p-1"><button type="button" onClick={() => void signOut({ callbackUrl: "/" })} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs text-red-300 hover:bg-red-400/[0.06]"><LogOut className="size-4" /> Terminar sessão</button></div></motion.div> : null}</AnimatePresence></div>}</div>
        <button type="button" className="rounded-xl p-2 text-zinc-500 transition hover:bg-white/[0.04] hover:text-white md:hidden" aria-label="Abrir menu" onClick={() => setMobileOpen((value) => !value)}>{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      </nav>
    </header>

    <AnimatePresence>{mobileOpen ? <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="fixed inset-x-0 top-16 z-40 border-t border-white/6 bg-[#060606]/95 p-4 backdrop-blur-xl md:hidden"><nav className="space-y-1">{navLinks.map((link) => <a key={link.label} href={link.href} target={link.target} rel={link.target === "_blank" ? "noopener noreferrer" : undefined} onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-3 text-sm text-zinc-400 hover:bg-white/[0.04] hover:text-white">{link.label}</a>)}</nav><div className="mt-4 grid gap-2 border-t border-white/6 pt-4">{user ? <><Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200"><LayoutDashboard className="size-4" /> Dashboard</Link><button type="button" onClick={() => void signOut({ callbackUrl: "/" })} className="flex items-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300"><LogOut className="size-4" /> Terminar sessão</button></> : <><Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200">Entrar</Link><Link href="/pricing" onClick={() => setMobileOpen(false)} className="flex items-center justify-center rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950">Ver planos</Link></>}</div></motion.div> : null}</AnimatePresence>
  </>;
}
