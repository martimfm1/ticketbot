"use client";

import {
  Save,
  Ticket,
  Loader2,
  Hash,
  Shield,
  Folder,
} from "lucide-react";

import { useEffect, useState } from "react";

import type { DashboardMetrics } from "@/types/dashboard";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TicketPanelsTabProps {
  data: DashboardMetrics;
  onSaved: () => Promise<void>;
  onToast: (
    message: string,
    type?: "success" | "error",
  ) => void;
}

interface DiscordRole {
  id: string;
  name: string;
  color: number;
}

interface DiscordCategory {
  id: string;
  name: string;
}

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  parentId: string | null;
}

export function TicketPanelsTab({
  data,
  onSaved,
  onToast,
}: TicketPanelsTabProps) {
  const server = data.servers.current;

  const [categoryId, setCategoryId] =
    useState(
      server?.ticketCategoryId ?? "",
    );

  const [roleName, setRoleName] =
    useState(
      server?.adminRoleName ?? "",
    );

  const [
    transcriptChannelId,
    setTranscriptChannelId,
  ] = useState(
    server?.transcriptChannelId ?? "",
  );

  const [language, setLanguage] =
    useState(
      server?.language ?? "en",
    );

  const [roles, setRoles] =
    useState<DiscordRole[]>([]);

  const [categories, setCategories] =
    useState<DiscordCategory[]>([]);

  const [channels, setChannels] =
    useState<DiscordChannel[]>([]);

  const [loadingOptions, setLoadingOptions] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /*
   * Keep local state synchronized when
   * changing Discord servers.
   */
  useEffect(() => {
    setCategoryId(
      server?.ticketCategoryId ?? "",
    );

    setRoleName(
      server?.adminRoleName ?? "",
    );

    setTranscriptChannelId(
      server?.transcriptChannelId ?? "",
    );

    setLanguage(
      server?.language ?? "en",
    );
  }, [server?.guildId]);

  /*
   * Load Discord roles and channels.
   */
  useEffect(() => {
    if (!server?.guildId) {
      setRoles([]);
      setCategories([]);
      setChannels([]);
      return;
    }

    let cancelled = false;

    async function loadDiscordOptions() {
      try {
        setLoadingOptions(true);

        const guildId = server?.guildId;
        if (!guildId) {
          return;
        }

        const [
          rolesResponse,
          channelsResponse,
        ] = await Promise.all([
          fetch(
            `/api/dashboard/roles?guildId=${encodeURIComponent(guildId)}`,
            {
              cache: "no-store",
            },
          ),

          fetch(
            `/api/dashboard/channels?guildId=${encodeURIComponent(guildId)}`,
            {
              cache: "no-store",
            },
          ),
        ]);

        if (
          !rolesResponse.ok ||
          !channelsResponse.ok
        ) {
          throw new Error(
            "Failed to load Discord options",
          );
        }

        const rolesData =
          await rolesResponse.json();

        const channelsData =
          await channelsResponse.json();

        if (cancelled) {
          return;
        }

        setRoles(
          Array.isArray(rolesData.roles)
            ? rolesData.roles
            : [],
        );

        setCategories(
          Array.isArray(
            channelsData.categories,
          )
            ? channelsData.categories
            : [],
        );

        setChannels(
          Array.isArray(
            channelsData.channels,
          )
            ? channelsData.channels
            : [],
        );
      } catch (error) {
        console.error(
          "[TicketPanelsTab] Failed to load Discord options",
          error,
        );

        if (!cancelled) {
          onToast(
            "Não foi possível carregar os dados do Discord.",
            "error",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    void loadDiscordOptions();

    return () => {
      cancelled = true;
    };
  }, [server?.guildId, onToast]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!server?.guildId) {
      onToast(
        "Nenhum servidor selecionado.",
        "error",
      );

      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/server-config",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            guild_id: server.guildId,

            ticket_category_id:
              categoryId || null,

            admin_role_name:
              roleName || null,

            transcript_channel_id:
              transcriptChannelId || null,

            language,

            security_config: {},
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to save configuration: ${response.status}`,
        );
      }

      await onSaved();

      onToast(
        "Configuração guardada.",
      );
    } catch (error) {
      console.error(
        "[TicketPanelsTab] Save failed",
        error,
      );

      onToast(
        "Não foi possível guardar a configuração.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedRole =
    roles.find(
      (role) => role.name === roleName,
    );

  const selectedCategory =
    categories.find(
      (category) =>
        category.id === categoryId,
    );

  const selectedChannel =
    channels.find(
      (channel) =>
        channel.id ===
        transcriptChannelId,
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40">
        <div className="border-b border-zinc-800/70 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <Ticket className="size-4 text-zinc-500" />
            Ticket Panel
          </h2>

          <p className="mt-1 text-xs text-zinc-600">
            Define onde e como os tickets são criados.
          </p>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          {/* Ticket Category */}

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
              <Folder className="size-3.5" />
              Ticket Category
            </label>

            <Select
              value={categoryId}
              onValueChange={(value) => {
                if (value !== null) {
                  setCategoryId(value);
                }
              }}
              disabled={
                loadingOptions ||
                categories.length === 0
              }
            >
              <SelectTrigger className="w-full border-zinc-800 bg-zinc-950 text-xs text-zinc-200">
                <SelectValue
                  placeholder={
                    loadingOptions
                      ? "Loading categories..."
                      : "Select a category"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {categories.map(
                  (category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                    >
                      <span className="flex items-center gap-2">
                        <Folder className="size-3.5 text-zinc-500" />
                        {category.name}
                      </span>
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            {selectedCategory && (
              <p className="mt-1.5 text-[10px] text-zinc-600">
                {selectedCategory.name}
              </p>
            )}
          </div>

          {/* Admin Role */}

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
              <Shield className="size-3.5" />
              Admin Role
            </label>

            <Select
              value={roleName}
              onValueChange={(value) => {
                if (value !== null) {
                  setRoleName(value);
                }
              }}
              disabled={
                loadingOptions ||
                roles.length === 0
              }
            >
              <SelectTrigger className="w-full border-zinc-800 bg-zinc-950 text-xs text-zinc-200">
                <SelectValue
                  placeholder={
                    loadingOptions
                      ? "Loading roles..."
                      : "Select a role"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {roles.map((role) => (
                  <SelectItem
                    key={role.id}
                    value={role.name}
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="size-3.5 text-zinc-500" />
                      {role.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedRole && (
              <p className="mt-1.5 text-[10px] text-zinc-600">
                {selectedRole.name}
              </p>
            )}
          </div>

          {/* Transcript Channel */}

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
              <Hash className="size-3.5" />
              Transcript Channel
            </label>

            <Select
              value={transcriptChannelId}
              onValueChange={(value) => {
                if (value !== null) {
                  setTranscriptChannelId(value);
                }
              }}
              disabled={
                loadingOptions ||
                channels.length === 0
              }
            >
              <SelectTrigger className="w-full border-zinc-800 bg-zinc-950 text-xs text-zinc-200">
                <SelectValue
                  placeholder={
                    loadingOptions
                      ? "Loading channels..."
                      : "Select a channel"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {channels.map(
                  (channel) => (
                    <SelectItem
                      key={channel.id}
                      value={channel.id}
                    >
                      <span className="flex items-center gap-2">
                        <Hash className="size-3.5 text-zinc-500" />
                        #{channel.name}
                      </span>
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            {selectedChannel && (
              <p className="mt-1.5 text-[10px] text-zinc-600">
                #{selectedChannel.name}
              </p>
            )}
          </div>

          {/* Language */}

          <div>
            <label className="mb-2 block text-xs text-zinc-500">
              Language
            </label>

            <Select
              value={language}
              onValueChange={(value) => {
                if (value !== null) {
                  setLanguage(value);
                }
              }}
            >
              <SelectTrigger className="w-full border-zinc-800 bg-zinc-950 text-xs text-zinc-200">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="en">
                  English
                </SelectItem>

                <SelectItem value="pt">
                  Português
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end border-t border-zinc-800/70 px-5 py-4">
          <button
            type="submit"
            disabled={
              saving ||
              loadingOptions ||
              !server?.guildId
            }
            className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}

            Guardar alterações
          </button>
        </div>
      </section>
    </form>
  );
}