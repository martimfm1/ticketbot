"use client";

import { Hash, Loader2, Save, Shield, Ticket, Folder, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { DashboardMetrics } from "@/types/dashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TicketPanelsTabProps {
  data: DashboardMetrics;
  onSaved: () => Promise<void>;
  onToast: (message: string, type?: "success" | "error") => void;
}

interface DiscordRole { id: string; name: string; color: number; }
interface DiscordCategory { id: string; name: string; }
interface DiscordChannel { id: string; name: string; type: number; parentId: string | null; }

type SaveState = "idle" | "saving" | "saved" | "error";

export function TicketPanelsTab({ data, onSaved, onToast }: TicketPanelsTabProps) {
  const server = data.servers.current;
  const [categoryId, setCategoryId] = useState(server?.ticketCategoryId ?? "");
  const [roleName, setRoleName] = useState(server?.adminRoleName ?? "");
  const [transcriptChannelId, setTranscriptChannelId] = useState(server?.transcriptChannelId ?? "");
  const [language, setLanguage] = useState(server?.language ?? "en");
  const [roles, setRoles] = useState<DiscordRole[]>([]);
  const [categories, setCategories] = useState<DiscordCategory[]>([]);
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const lastSavedRef = useRef("");

  const configuration = {
    guild_id: server?.guildId ?? "",
    ticket_category_id: categoryId || null,
    admin_role_name: roleName || null,
    transcript_channel_id: transcriptChannelId || null,
    language,
  };

  const configurationKey = JSON.stringify(configuration);

  useEffect(() => {
    setCategoryId(server?.ticketCategoryId ?? "");
    setRoleName(server?.adminRoleName ?? "");
    setTranscriptChannelId(server?.transcriptChannelId ?? "");
    setLanguage(server?.language ?? "en");

    lastSavedRef.current = JSON.stringify({
      guild_id: server?.guildId ?? "",
      ticket_category_id: server?.ticketCategoryId ?? null,
      admin_role_name: server?.adminRoleName ?? null,
      transcript_channel_id: server?.transcriptChannelId ?? null,
      language: server?.language ?? "en",
    });
    setSaveState("idle");
  }, [server?.guildId, server?.ticketCategoryId, server?.adminRoleName, server?.transcriptChannelId, server?.language]);

  useEffect(() => {
    const selectedGuildId = server?.guildId;
    if (!selectedGuildId) {
      setRoles([]);
      setCategories([]);
      setChannels([]);
      setLoadingOptions(false);
      return;
    }

    let cancelled = false;

    async function loadDiscordOptions() {
      try {
        setLoadingOptions(true);

        const [rolesResponse, channelsResponse] = await Promise.all([
          fetch(`/api/dashboard/roles?guildId=${encodeURIComponent(selectedGuildId)}`, { cache: "no-store", headers: { Accept: "application/json" } }),
          fetch(`/api/dashboard/channels?guildId=${encodeURIComponent(selectedGuildId)}`, { cache: "no-store", headers: { Accept: "application/json" } }),
        ]);

        if (!rolesResponse.ok || !channelsResponse.ok) throw new Error("Failed to load Discord options");

        const rolesData = await rolesResponse.json();
        const channelsData = await channelsResponse.json();
        if (cancelled) return;

        setRoles(Array.isArray(rolesData.roles) ? rolesData.roles : []);
        setCategories(Array.isArray(channelsData.categories) ? channelsData.categories : []);
        setChannels(Array.isArray(channelsData.channels) ? channelsData.channels : []);
      } catch (error) {
        console.error("[TicketPanelsTab] Failed to load Discord options", error);
        if (!cancelled) onToast("Discord options could not be loaded.", "error");
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }

    void loadDiscordOptions();
    return () => { cancelled = true; };
  }, [server?.guildId, onToast]);

  async function persistConfiguration(showToast = false) {
    const guildId = server?.guildId;
    if (!guildId) return false;
    if (configurationKey === lastSavedRef.current) { setSaveState("saved"); return true; }

    setSaveState("saving");
    try {
      const response = await fetch("/api/server-config", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...configuration, security_config: {} }),
      });

      if (!response.ok) {
        let message = "The configuration could not be saved.";
        try { const body = await response.json(); if (typeof body?.error === "string") message = body.error; } catch { /* Ignore invalid error responses. */ }
        throw new Error(message);
      }

      lastSavedRef.current = configurationKey;
      setSaveState("saved");
      if (showToast) onToast("Configuration saved.");
      await onSaved();
      return true;
    } catch (error) {
      console.error("[TicketPanelsTab] Save failed", error);
      setSaveState("error");
      onToast(error instanceof Error ? error.message : "The configuration could not be saved.", "error");
      return false;
    }
  }

  useEffect(() => {
    if (!server?.guildId || configurationKey === lastSavedRef.current) return;
    const timeout = window.setTimeout(() => void persistConfiguration(), 600);
    return () => window.clearTimeout(timeout);
    // configurationKey is the complete, serialised editable state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configurationKey, server?.guildId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await persistConfiguration(true);
  }

  const selectedRole = roles.find((role) => role.name === roleName);
  const selectedCategory = categories.find((category) => category.id === categoryId);
  const selectedChannel = channels.find((channel) => channel.id === transcriptChannelId);
  const saveLabel = saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : saveState === "error" ? "Retry save" : "Save now";

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="ticket-panel-heading">
      <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/70 px-5 py-4">
          <div>
            <h2 id="ticket-panel-heading" className="flex items-center gap-2 text-sm font-semibold text-zinc-200"><Ticket className="size-4 text-zinc-500" aria-hidden="true" />Ticket panel</h2>
            <p className="mt-1 text-xs text-zinc-600">Changes are saved automatically and applied to the selected server.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px]" aria-live="polite">
            {saveState === "saving" && <Loader2 className="size-3.5 animate-spin text-zinc-500" aria-hidden="true" />}
            {saveState === "saved" && <CheckCircle2 className="size-3.5 text-emerald-500" aria-hidden="true" />}
            <span className={saveState === "error" ? "text-red-400" : "text-zinc-500"}>{saveState === "saving" ? "Saving changes…" : saveState === "saved" ? "All changes saved" : saveState === "error" ? "Save failed" : "Ready"}</span>
          </div>
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div><label htmlFor="ticket-category" className="mb-2 flex items-center gap-2 text-xs text-zinc-500"><Folder className="size-3.5" aria-hidden="true" />Ticket category</label><Select value={categoryId} onValueChange={(value) => value !== null && setCategoryId(value)} disabled={loadingOptions || categories.length === 0}><SelectTrigger id="ticket-category" aria-label="Ticket category" className="w-full border-zinc-800 bg-zinc-950 text-xs text-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-400/70"><SelectValue placeholder={loadingOptions ? "Loading categories…" : "Select a category"} /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.id} value={category.id}><span className="flex items-center gap-2"><Folder className="size-3.5 text-zinc-500" aria-hidden="true" />{category.name}</span></SelectItem>)}</SelectContent></Select>{selectedCategory && <p className="mt-1.5 text-[10px] text-zinc-600">{selectedCategory.name}</p>}</div>
          <div><label htmlFor="admin-role" className="mb-2 flex items-center gap-2 text-xs text-zinc-500"><Shield className="size-3.5" aria-hidden="true" />Admin role</label><Select value={roleName} onValueChange={(value) => value !== null && setRoleName(value)} disabled={loadingOptions || roles.length === 0}><SelectTrigger id="admin-role" aria-label="Admin role" className="w-full border-zinc-800 bg-zinc-950 text-xs text-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-400/70"><SelectValue placeholder={loadingOptions ? "Loading roles…" : "Select a role"} /></SelectTrigger><SelectContent>{roles.map((role) => <SelectItem key={role.id} value={role.id}><span className="flex items-center gap-2"><Shield className="size-3.5 text-zinc-500" aria-hidden="true" />{role.name}</span></SelectItem>)}</SelectContent></Select>{selectedRole && <p className="mt-1.5 text-[10px] text-zinc-600">{selectedRole.name}</p>}</div>
          <div><label htmlFor="transcript-channel" className="mb-2 flex items-center gap-2 text-xs text-zinc-500"><Hash className="size-3.5" aria-hidden="true" />Transcript channel</label><Select value={transcriptChannelId} onValueChange={(value) => value !== null && setTranscriptChannelId(value)} disabled={loadingOptions || channels.length === 0}><SelectTrigger id="transcript-channel" aria-label="Transcript channel" className="w-full border-zinc-800 bg-zinc-950 text-xs text-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-400/70"><SelectValue placeholder={loadingOptions ? "Loading channels…" : "Select a channel"} /></SelectTrigger><SelectContent>{channels.map((channel) => <SelectItem key={channel.id} value={channel.id}><span className="flex items-center gap-2"><Hash className="size-3.5 text-zinc-500" aria-hidden="true" />#{channel.name}</span></SelectItem>)}</SelectContent></Select>{selectedChannel && <p className="mt-1.5 text-[10px] text-zinc-600">#{selectedChannel.name}</p>}</div>
          <div><label htmlFor="dashboard-language" className="mb-2 block text-xs text-zinc-500">Bot language</label><Select value={language} onValueChange={(value) => value !== null && setLanguage(value)}><SelectTrigger id="dashboard-language" aria-label="Bot language" className="w-full border-zinc-800 bg-zinc-950 text-xs text-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-400/70"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="pt">Portuguese</SelectItem></SelectContent></Select></div>
        </div>
        <div className="flex justify-end border-t border-zinc-800/70 px-5 py-4"><button type="submit" disabled={saveState === "saving" || loadingOptions || !server?.guildId} aria-busy={saveState === "saving"} className="flex min-h-10 items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/70 disabled:cursor-not-allowed disabled:opacity-50">{saveState === "saving" ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Save className="size-3.5" aria-hidden="true" />}{saveLabel}</button></div>
      </section>
    </form>
  );
}
