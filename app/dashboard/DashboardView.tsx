"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Server,
  Ticket,
  Layers,
  Users,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Save,
  ShieldAlert,
  Search,
  RefreshCw,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { FullDashboardData, SuggestionItem } from "@/types/dashboard";

interface DashboardViewProps {
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  initialData: FullDashboardData;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function DashboardView({ user, initialData }: DashboardViewProps) {
  const [data, setData] = useState<FullDashboardData>(initialData);
  const [activeTab, setActiveTab] = useState("Overview");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Estado para pesquisa/filtros
  const [searchTerm, setSearchTerm] = useState("");

  // Estado dos formulários de definição
  const [formData, setFormData] = useState({
    ticket_category_id: data.serverConfig.ticket_category_id || "",
    admin_role_name: data.serverConfig.admin_role_name || "",
    transcript_channel_id: data.serverConfig.transcript_channel_id || "",
    language: data.serverConfig.language || "en",
    security_anti_spam: data.securityConfig?.anti_spam ?? true,
    security_max_tickets: data.securityConfig?.max_tickets_per_user || 3,
  });

  const addToast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Recarregar dados manualmente via API
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/dashboard-metrics?guild_id=${data.guildId}`);
      if (res.ok) {
        const freshData = await res.json();
        setData(freshData);
        addToast("Dados atualizados com sucesso!");
      }
    } catch {
      addToast("Erro ao recarregar dados", "error");
    } finally {
      setRefreshing(false);
    }
  };

  // Guardar configurações
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/server-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guild_id: data.guildId,
          ticket_category_id: formData.ticket_category_id,
          admin_role_name: formData.admin_role_name,
          transcript_channel_id: formData.transcript_channel_id,
          language: formData.language,
          security_config: {
            anti_spam: formData.security_anti_spam,
            max_tickets_per_user: Number(formData.security_max_tickets),
          },
        }),
      });

      if (!res.ok) throw new Error();
      addToast("Configurações gravadas na base de dados!");
    } catch {
      addToast("Falha ao guardar alterações", "error");
    } finally {
      setSaving(false);
    }
  };

  // Moderar Sugestões
  const handleModerateSuggestion = async (messageId: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/suggestions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: messageId, status }),
      });

      if (!res.ok) throw new Error();

      setData((prev) => ({
        ...prev,
        suggestions: prev.suggestions.map((s) =>
          s.message_id === messageId ? { ...s, status } : s
        ),
      }));
      addToast(`Sugestão ${status === "approved" ? "aprovada" : "rejeitada"}!`);
    } catch {
      addToast("Erro ao processar sugestão", "error");
    }
  };

  // Filtros de busca computados
  const filteredTranscripts = useMemo(() => {
    return data.transcripts.filter(
      (t) =>
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user_id.includes(searchTerm) ||
        t.channel_id.includes(searchTerm)
    );
  }, [data.transcripts, searchTerm]);

  const sidebarItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Servers", icon: Server },
    { name: "Ticket Panels", icon: Ticket },
    { name: "Categories", icon: Layers },
    { name: "Staff", icon: Users },
    { name: "Transcripts", icon: FileText },
    { name: "Analytics", icon: BarChart3 },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex selection:bg-zinc-800 relative">
      {/* Sistema de Toasts Flutuantes */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`px-4 py-3 rounded-lg border text-xs font-medium shadow-lg pointer-events-auto flex items-center gap-2 ${
                toast.type === "success"
                  ? "bg-zinc-900 border-emerald-500/30 text-emerald-400"
                  : "bg-zinc-900 border-red-500/30 text-red-400"
              }`}
            >
              {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950/60 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <button className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-colors text-xs font-medium text-zinc-200">
            <span className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Guild #{data.guildId.slice(-6)}
            </span>
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          </button>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setSearchTerm("");
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-zinc-900 text-zinc-100 border border-zinc-800"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-zinc-100" : "text-zinc-500"}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full border border-zinc-800 shrink-0 object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs">
                {user.name[0]}
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-medium text-zinc-200 truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-500 font-mono">#{user.id.slice(0, 5)}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Area Principal */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <header className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">{activeTab}</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Gestão em Tempo Real do Bot</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
              title="Sincronizar dados"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
            </button>
            <span className="text-xs font-mono text-zinc-500 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
              guild:{data.guildId}
            </span>
          </div>
        </header>

        {/* Renderização Dinâmica de Conteúdo com Framer Motion */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            {activeTab === "Overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                    <span className="text-xs text-zinc-400 font-medium">Tickets Abertos</span>
                    <p className="text-2xl font-bold mt-3 text-zinc-100">{data.overview.openTickets}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                    <span className="text-xs text-zinc-400 font-medium">Resolvidos Hoje</span>
                    <p className="text-2xl font-bold mt-3 text-zinc-100">{data.overview.resolvedToday}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                    <span className="text-xs text-zinc-400 font-medium">Sugestões Pendentes</span>
                    <p className="text-2xl font-bold mt-3 text-zinc-100">{data.overview.pendingSuggestions}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                    <span className="text-xs text-zinc-400 font-medium">Atividade (24h)</span>
                    <p className="text-2xl font-bold mt-3 text-zinc-100">{data.overview.total24h}</p>
                  </div>
                </div>

                {/* Moderação de Sugestões Pendentes no Overview */}
                {data.suggestions.filter((s) => s.status === "pending").length > 0 && (
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
                    <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Sugestões Aguardando Moderação</h2>
                    <div className="divide-y divide-zinc-800/60">
                      {data.suggestions
                        .filter((s) => s.status === "pending")
                        .map((s) => (
                          <div key={s.message_id} className="py-3 flex items-center justify-between text-xs">
                            <div>
                              <p className="text-zinc-200 font-medium">{s.suggestion_text}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">Autor: {s.author_id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleModerateSuggestion(s.message_id, "approved")}
                                className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                                title="Aprovar"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleModerateSuggestion(s.message_id, "rejected")}
                                className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                title="Rejeitar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Transcripts" && (
              <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" /> Transcripts Gravados
                  </h2>
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Pesquisar transcript..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="divide-y divide-zinc-800/60">
                  {filteredTranscripts.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-4">Nenhum transcript encontrado para o filtro.</p>
                  ) : (
                    filteredTranscripts.map((t) => (
                      <div key={t.channel_id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-medium text-zinc-200">{t.subject}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">Channel: {t.channel_id} | User: {t.user_id}</p>
                        </div>
                        <span className="text-zinc-500 font-mono text-[11px]">
                          {t.closed_at ? new Date(t.closed_at).toLocaleDateString() : "Fechado"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {(activeTab === "Ticket Panels" || activeTab === "Settings") && (
              <form onSubmit={handleSaveConfig} className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
                <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-zinc-400" /> Guardar Definições
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1">Category ID</label>
                    <input
                      type="text"
                      value={formData.ticket_category_id}
                      onChange={(e) => setFormData({ ...formData, ticket_category_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Admin Role Name</label>
                    <input
                      type="text"
                      value={formData.admin_role_name}
                      onChange={(e) => setFormData({ ...formData, admin_role_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Guardar Dados
                </button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}