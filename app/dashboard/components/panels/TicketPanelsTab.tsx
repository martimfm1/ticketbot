"use client";

import { Eye, Loader2, Save, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import type { DashboardMetrics, TicketCustomization } from "@/types/dashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props { data: DashboardMetrics; guildId: string; onSaved: () => Promise<void>; onToast: (message: string, type?: "success" | "error") => void; }
interface Role { id: string; name: string; color: number; }
interface Category { id: string; name: string; }
interface Channel { id: string; name: string; type: number; parentId: string | null; }

const DEFAULTS: TicketCustomization = {
  panelTitle: "Need help?", panelDescription: "Open a private support ticket and our team will help you as soon as possible.", panelFooter: "SILENTRA Ticket", panelColor: "#18181B",
  panelButtonLabel: "Open Ticket", panelButtonEmoji: "🎫", panelButtonStyle: "secondary",
  ticketTitle: "Ticket opened for {member}", ticketDescription: "Thanks for contacting support. A member of the team will be with you shortly.", ticketFooter: "SILENTRA Ticket", ticketColor: "#18181B",
  welcomeMessage: "{member} {support_role}\n\nPlease describe your issue and include any useful details.", modalTitle: "Open a Support Ticket", modalSubjectLabel: "Subject", modalSubjectPlaceholder: "Briefly describe what you need help with", channelPrefix: "ticket-", mentionSupport: true, allowUserAttachments: true,
};

export function TicketPanelsTab({ data, guildId, onSaved, onToast }: Props) {
  const server = data.servers.current;
  const [categoryId, setCategoryId] = useState(server?.ticketCategoryId ?? "");
  const [roleId, setRoleId] = useState(server?.adminRoleId ?? "");
  const [transcriptChannelId, setTranscriptChannelId] = useState(server?.transcriptChannelId ?? "");
  const [language, setLanguage] = useState(server?.language ?? "en");
  const [customization, setCustomization] = useState(server?.ticketCustomization ?? DEFAULTS);
  const [roles, setRoles] = useState<Role[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCategoryId(server?.ticketCategoryId ?? ""); setRoleId(server?.adminRoleId ?? ""); setTranscriptChannelId(server?.transcriptChannelId ?? ""); setLanguage(server?.language ?? "en"); setCustomization(server?.ticketCustomization ?? DEFAULTS);
  }, [server?.guildId, server?.adminRoleId, server?.ticketCategoryId, server?.transcriptChannelId, server?.language, server?.ticketCustomization]);

  useEffect(() => {
    if (!guildId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [r, c] = await Promise.all([
          fetch(`/api/dashboard/roles?guildId=${encodeURIComponent(guildId)}`, { cache: "no-store" }),
          fetch(`/api/dashboard/channels?guildId=${encodeURIComponent(guildId)}`, { cache: "no-store" }),
        ]);
        const [rd, cd] = await Promise.all([r.json().catch(() => ({})), c.json().catch(() => ({}))]);
        if (!r.ok) throw new Error(rd?.error ?? `Roles request failed (${r.status})`);
        if (!c.ok) throw new Error(cd?.error ?? `Channels request failed (${c.status})`);
        if (cancelled) return;
        setRoles(Array.isArray(rd.roles) ? rd.roles : []); setCategories(Array.isArray(cd.categories) ? cd.categories : []); setChannels(Array.isArray(cd.channels) ? cd.channels : []);
      } catch (error) { if (!cancelled) onToast(error instanceof Error ? error.message : "Não foi possível carregar os dados do Discord.", "error"); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [guildId, onToast]);

  const update = <K extends keyof TicketCustomization>(key: K, value: TicketCustomization[K]) => setCustomization((v) => ({ ...v, [key]: value }));

  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!guildId) return onToast("Nenhum servidor selecionado.", "error");
    setSaving(true);
    try {
      const selectedRole = roles.find((r) => r.id === roleId);
      const response = await fetch("/api/server-config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guild_id: guildId, ticket_category_id: categoryId || null, admin_role_id: roleId || null, admin_role_name: selectedRole?.name ?? null, ticket_role_id: roleId || null, transcript_channel_id: transcriptChannelId || null, language, ticket_panel_config: customization }) });
      const result = await response.json().catch(() => ({})); if (!response.ok) throw new Error(result?.error ?? `Falha ao guardar (${response.status})`);
      await onSaved(); onToast("Personalização guardada.");
    } catch (error) { onToast(error instanceof Error ? error.message : "Não foi possível guardar a configuração.", "error"); }
    finally { setSaving(false); }
  }

  return <form onSubmit={save} className="space-y-6">
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <div className="mb-5"><h2 className="flex items-center gap-2 text-sm font-semibold"><Ticket className="size-4 text-zinc-500" />Ticket setup</h2><p className="mt-1 text-xs text-zinc-500">Onde e como os tickets são criados.</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Ticket category"><Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)} disabled={loading || !categories.length}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map((x) => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Support role"><Select value={roleId} onValueChange={(v) => v && setRoleId(v)} disabled={loading || !roles.length}><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent>{roles.map((x) => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Transcript channel"><Select value={transcriptChannelId} onValueChange={(v) => v && setTranscriptChannelId(v)} disabled={loading || !channels.length}><SelectTrigger><SelectValue placeholder="Select channel" /></SelectTrigger><SelectContent>{channels.map((x) => <SelectItem key={x.id} value={x.id}>#{x.name}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Language"><Select value={language} onValueChange={(v) => v && setLanguage(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="pt-PT">Português (PT)</SelectItem><SelectItem value="pt-BR">Português (BR)</SelectItem></SelectContent></Select></Field>
      </div>
    </section>

    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <div className="mb-5"><h2 className="text-sm font-semibold">Branding & panel</h2><p className="mt-1 text-xs text-zinc-500">Personaliza o painel visível no Discord.</p></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Panel title"><input value={customization.panelTitle} onChange={(e) => update("panelTitle", e.target.value)} /></Field>
        <Field label="Button label"><input value={customization.panelButtonLabel} onChange={(e) => update("panelButtonLabel", e.target.value)} /></Field>
        <Field label="Panel description" className="lg:col-span-2"><textarea rows={4} value={customization.panelDescription} onChange={(e) => update("panelDescription", e.target.value)} /></Field>
        <Field label="Footer"><input value={customization.panelFooter} onChange={(e) => update("panelFooter", e.target.value)} /></Field>
        <Field label="Button emoji"><input value={customization.panelButtonEmoji} onChange={(e) => update("panelButtonEmoji", e.target.value)} /></Field>
        <Field label="Panel color"><input type="color" value={customization.panelColor} onChange={(e) => update("panelColor", e.target.value.toUpperCase())} className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-1" /></Field>
        <Field label="Button style"><Select value={customization.panelButtonStyle} onValueChange={(v) => update("panelButtonStyle", v as TicketCustomization["panelButtonStyle"]) }><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="secondary">Secondary</SelectItem><SelectItem value="primary">Primary</SelectItem><SelectItem value="success">Success</SelectItem><SelectItem value="danger">Danger</SelectItem></SelectContent></Select></Field>
      </div>
      <div className="mt-5"><Preview config={customization} /></div>
    </section>

    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <div className="mb-5"><h2 className="text-sm font-semibold">Ticket experience</h2><p className="mt-1 text-xs text-zinc-500">Modal, mensagens e naming.</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Modal title"><input value={customization.modalTitle} onChange={(e) => update("modalTitle", e.target.value)} /></Field>
        <Field label="Subject label"><input value={customization.modalSubjectLabel} onChange={(e) => update("modalSubjectLabel", e.target.value)} /></Field>
        <Field label="Subject placeholder"><input value={customization.modalSubjectPlaceholder} onChange={(e) => update("modalSubjectPlaceholder", e.target.value)} /></Field>
        <Field label="Channel prefix"><input value={customization.channelPrefix} onChange={(e) => update("channelPrefix", e.target.value.replace(/\s/g, "-").slice(0, 20))} /></Field>
        <Field label="Ticket title"><input value={customization.ticketTitle} onChange={(e) => update("ticketTitle", e.target.value)} /><Hint>{"{member}"}, {"{subject}"}, {"{support_role}"}</Hint></Field>
        <Field label="Ticket footer"><input value={customization.ticketFooter} onChange={(e) => update("ticketFooter", e.target.value)} /></Field>
        <Field label="Ticket description" className="md:col-span-2"><textarea rows={4} value={customization.ticketDescription} onChange={(e) => update("ticketDescription", e.target.value)} /></Field>
        <Field label="Welcome message" className="md:col-span-2"><textarea rows={4} value={customization.welcomeMessage} onChange={(e) => update("welcomeMessage", e.target.value)} /><Hint>{"{member}"}, {"{subject}"}, {"{support_role}"}</Hint></Field>
        <Field label="Ticket color"><input type="color" value={customization.ticketColor} onChange={(e) => update("ticketColor", e.target.value.toUpperCase())} className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-1" /></Field>
      </div>
      <div className="mt-5 flex flex-wrap gap-3"><Toggle label="Mention support role" checked={customization.mentionSupport} onChange={(v) => update("mentionSupport", v)} /><Toggle label="Allow user attachments" checked={customization.allowUserAttachments} onChange={(v) => update("allowUserAttachments", v)} /></div>
    </section>

    <div className="sticky bottom-3 z-20 flex justify-end rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-3 shadow-2xl backdrop-blur-xl"><button type="submit" disabled={saving || loading || !guildId} className="flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-zinc-950 disabled:opacity-50">{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Save customization</button></div>
  </form>;
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) { return <div className={className}><label className="mb-2 block text-xs font-medium text-zinc-400">{label}</label>{children}</div>; }
function Hint({ children }: { children: React.ReactNode }) { return <p className="mt-1 text-[10px] leading-4 text-zinc-600">{children}</p>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) { return <button type="button" onClick={() => onChange(!checked)} className="flex min-h-11 items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-300"><span className={`flex h-5 w-9 rounded-full p-0.5 ${checked ? "bg-emerald-500" : "bg-zinc-700"}`}><span className={`size-4 rounded-full bg-white transition ${checked ? "translate-x-4" : ""}`} /></span>{label}</button>; }
function Preview({ config }: { config: TicketCustomization }) { return <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"><div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500"><Eye className="size-3.5" />Discord preview</div><div className="rounded-xl border p-4" style={{ borderColor: `${config.panelColor}99` }}><div className="text-sm font-semibold text-white">{config.panelTitle}</div><div className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-400">{config.panelDescription}</div><div className="mt-4 flex items-center justify-between gap-3"><span className="text-[10px] text-zinc-600">{config.panelFooter}</span><span className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: config.panelButtonStyle === "danger" ? "#dc2626" : config.panelButtonStyle === "success" ? "#059669" : config.panelButtonStyle === "primary" ? "#ffffff" : "#3f3f46", color: config.panelButtonStyle === "primary" ? "#09090b" : "#fff" }}>{config.panelButtonEmoji} {config.panelButtonLabel}</span></div></div></div>; }
