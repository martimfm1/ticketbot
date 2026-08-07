import Link from "next/link";
import BackButton from "@/components/BackButton";

export default function APIReference() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        <div className="fixed left-6 top-6 z-50">
          <BackButton />
        </div>

        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            API Reference
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Reference for the Discord commands, interactions, persistent views
            and database operations exposed by SILENTRA Ticket Bot.
          </p>
        </header>

        <div className="mb-10 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm font-medium text-zinc-200">
            No public HTTP API
          </p>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            SILENTRA Ticket Bot currently exposes its functionality through
            Discord interactions rather than a public REST API.
          </p>
        </div>

        {/* Slash Commands */}
        <section className="mb-12">
          <h2 className="mb-5 text-xl font-medium">Slash Commands</h2>

          <div className="space-y-6">
            <div className="rounded-lg border border-zinc-800 p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <code className="text-sm text-zinc-100">/configure-bot</code>

                <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400">
                  Administrator
                </span>
              </div>

              <p className="text-sm leading-6 text-zinc-400">
                Opens the bot configuration interface for the current Discord
                server.
              </p>

              <h3 className="mt-5 mb-2 text-sm font-medium text-zinc-200">
                Configuration options
              </h3>

              <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-500">
                <li>Ticket category</li>
                <li>Admin/staff role</li>
                <li>Transcript channel</li>
                <li>Server language</li>
                <li>Ticket panel</li>
              </ul>
            </div>

            <div className="rounded-lg border border-zinc-800 p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <code className="text-sm text-zinc-100">/ticket-test</code>

                <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400">
                  Utility
                </span>
              </div>

              <p className="text-sm leading-6 text-zinc-400">
                Opens the ticket creation modal and allows a user to create a
                ticket directly.
              </p>
            </div>
          </div>
        </section>

        {/* Ticket Panel */}
        <section className="mb-12">
          <h2 className="mb-5 text-xl font-medium">Ticket Panel</h2>

          <div className="rounded-lg border border-zinc-800 p-5">
            <h3 className="mb-2 text-sm font-medium text-zinc-200">
              Create Ticket
            </h3>

            <p className="mb-4 text-sm leading-6 text-zinc-400">
              The ticket panel provides the primary interface for users to open
              a support ticket.
            </p>

            <div className="rounded-lg bg-zinc-900 p-4">
              <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">
                Custom ID
              </p>

              <code className="text-sm text-zinc-200">
                create_ticket_btn:{"{guild_id}"}
              </code>
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-500">
              The button is implemented as a persistent Discord view and is
              re-registered when the bot starts.
            </p>
          </div>
        </section>

        {/* Ticket Modal */}
        <section className="mb-12">
          <h2 className="mb-5 text-xl font-medium">Ticket Creation Modal</h2>

          <div className="rounded-lg border border-zinc-800 p-5">
            <p className="mb-5 text-sm leading-6 text-zinc-400">
              When a user opens a ticket, SILENTRA displays a modal requesting
              the ticket subject.
            </p>

            <div className="rounded-lg bg-zinc-900 p-4">
              <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">
                Field
              </p>

              <code className="text-sm text-zinc-200">subject</code>

              <p className="mt-2 text-xs text-zinc-500">
                Maximum length: 300 characters
              </p>
            </div>
          </div>
        </section>

        {/* Ticket Controls */}
        <section className="mb-12">
          <h2 className="mb-5 text-xl font-medium">Ticket Controls</h2>

          <div className="space-y-5">
            <div className="rounded-lg border border-zinc-800 p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h3 className="text-sm font-medium">Close Ticket</h3>

                <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400">
                  Staff / Owner
                </span>
              </div>

              <div className="mb-4 rounded-lg bg-zinc-900 p-4">
                <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">
                  Custom ID
                </p>

                <code className="text-sm text-zinc-200">
                  close_ticket_btn:{"{guild_id}"}
                </code>
              </div>

              <p className="text-sm leading-6 text-zinc-400">
                Closes the ticket, processes the transcript and removes the
                ticket channel after the database operation completes.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h3 className="text-sm font-medium">Notify Member</h3>

                <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400">
                  Staff
                </span>
              </div>

              <div className="mb-4 rounded-lg bg-zinc-900 p-4">
                <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">
                  Custom ID
                </p>

                <code className="text-sm text-zinc-200">
                  notify_member_btn:{"{guild_id}"}
                </code>
              </div>

              <p className="text-sm leading-6 text-zinc-400">
                Allows authorized staff to notify the member associated with the
                ticket.
              </p>
            </div>
          </div>
        </section>

        {/* Ticket Lifecycle */}
        <section className="mb-12">
          <h2 className="mb-5 text-xl font-medium">Ticket Lifecycle</h2>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
            <div className="space-y-2 text-sm">
              <p className="text-zinc-300">User opens the ticket panel</p>
              <p className="text-zinc-600">↓</p>
              <p className="text-zinc-300">
                Ticket creation modal is displayed
              </p>
              <p className="text-zinc-600">↓</p>
              <p className="text-zinc-300">Server configuration is validated</p>
              <p className="text-zinc-600">↓</p>
              <p className="text-zinc-300">
                Private Discord channel is created
              </p>
              <p className="text-zinc-600">↓</p>
              <p className="text-zinc-300">Ticket is persisted in Supabase</p>
              <p className="text-zinc-600">↓</p>
              <p className="text-zinc-300">Ticket controls are attached</p>
            </div>
          </div>
        </section>

        {/* Database Repository */}
        <section className="mb-12">
          <h2 className="mb-5 text-xl font-medium">Database Repository</h2>

          <p className="mb-5 text-sm leading-6 text-zinc-400">
            Database access is isolated behind the repository layer instead of
            being directly coupled to Discord interactions.
          </p>

          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-5">
            <pre className="text-sm leading-7 text-zinc-300">
              <code>{`get_server_config()
save_server_config()
set_server_language()

create_ticket_db()
get_ticket_by_channel_id()

update_ticket_status()
close_ticket_db()
delete_ticket_by_channel_id()

get_all_server_ids()`}</code>
            </pre>
          </div>
        </section>

        {/* Server Configuration */}
        <section className="mb-12">
          <h2 className="mb-5 text-xl font-medium">Server Configuration</h2>

          <p className="mb-5 text-sm leading-6 text-zinc-400">
            Each Discord server has its own configuration stored in the
            database.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-800 p-4">
              <code className="text-sm text-zinc-200">guild_id</code>
              <p className="mt-1 text-xs text-zinc-500">
                Discord server identifier.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 p-4">
              <code className="text-sm text-zinc-200">ticket_category_id</code>
              <p className="mt-1 text-xs text-zinc-500">
                Category used for ticket channels.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 p-4">
              <code className="text-sm text-zinc-200">admin_role_name</code>
              <p className="mt-1 text-xs text-zinc-500">
                Staff role used for ticket access.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 p-4">
              <code className="text-sm text-zinc-200">
                transcript_channel_id
              </code>
              <p className="mt-1 text-xs text-zinc-500">
                Channel used for ticket transcripts.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 p-4">
              <code className="text-sm text-zinc-200">language</code>
              <p className="mt-1 text-xs text-zinc-500">Server localization.</p>
            </div>
          </div>
        </section>

        {/* Supported Locales */}
        <section className="mb-12">
          <h2 className="mb-5 text-xl font-medium">Localization</h2>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-800 p-4">
              <p className="text-sm font-medium">English</p>
              <code className="text-xs text-zinc-500">en</code>
            </div>

            <div className="rounded-lg border border-zinc-800 p-4">
              <p className="text-sm font-medium">Português — Portugal</p>
              <code className="text-xs text-zinc-500">pt-PT</code>
            </div>

            <div className="rounded-lg border border-zinc-800 p-4">
              <p className="text-sm font-medium">Português — Brasil</p>
              <code className="text-xs text-zinc-500">pt-BR</code>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="mb-12">
          <h2 className="mb-5 text-xl font-medium">Security</h2>

          <div className="space-y-3">
            <div className="rounded-lg border border-zinc-800 p-4">
              <p className="text-sm font-medium">Permission Validation</p>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Administrative and staff actions are validated before privileged
                operations are executed.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 p-4">
              <p className="text-sm font-medium">Guild Validation</p>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Configured Discord categories, roles and channels are validated
                against the current guild.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 p-4">
              <p className="text-sm font-medium">Environment Secrets</p>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Discord and Supabase credentials are loaded from environment
                variables and should never be committed to source control.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 p-4">
              <p className="text-sm font-medium">Database Abstraction</p>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Database access is isolated through the repository layer.
              </p>
            </div>
          </div>
        </section>

        <div className="border-t border-zinc-800 pt-6">
          <p className="text-sm text-zinc-500">
            Return to the{" "}
            <Link href="/docs" className="text-foreground hover:underline">
              documentation index
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
