import Link from "next/link";
import BackButton from "@/components/BackButton";

export default function GettingStarted() {
  return (
    <div className="min-h-screen bg-background">
      <div className="lg:pl-64">
        <main className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
          <div className="fixed left-6 top-6 z-50">
            <BackButton />
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight">
              Getting Started
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Get SILENTRA Ticket Bot running on your Discord server in a few
              simple steps.
            </p>
          </div>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium">Requirements</h2>

            <p className="mb-4 text-sm leading-6 text-zinc-400">
              Before installing SILENTRA Ticket Bot, make sure you have the
              following:
            </p>

            <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-400">
              <li>Python 3.10, 3.11 or 3.12</li>
              <li>A Discord application and bot</li>
              <li>A Discord server where you can manage the bot</li>
              <li>A Supabase project</li>
              <li>Git</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium">
              1. Clone the repository
            </h2>

            <p className="mb-3 text-sm leading-6 text-zinc-400">
              Clone the official SILENTRA Ticket Bot repository and navigate
              into the project directory.
            </p>

            <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-200">
              <code>{`git clone https://github.com/martimfm1/silentra-ticket.git
cd silentra-ticket`}</code>
            </pre>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium">
              2. Create a virtual environment
            </h2>

            <p className="mb-3 text-sm leading-6 text-zinc-400">
              Using a virtual environment keeps the bot's dependencies isolated
              from your system Python installation.
            </p>

            <h3 className="mb-2 text-sm font-medium text-zinc-200">Windows</h3>

            <pre className="mb-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-200">
              <code>{`python -m venv .venv
.venv\\Scripts\\activate`}</code>
            </pre>

            <h3 className="mb-2 text-sm font-medium text-zinc-200">
              Linux / macOS
            </h3>

            <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-200">
              <code>{`python3 -m venv .venv
source .venv/bin/activate`}</code>
            </pre>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium">
              3. Install dependencies
            </h2>

            <p className="mb-3 text-sm leading-6 text-zinc-400">
              Install all required Python dependencies from the project's
              requirements file.
            </p>

            <pre className="mb-3 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-200">
              <code>pip install -r requirements.txt</code>
            </pre>

            <p className="text-sm leading-6 text-zinc-500">
              The project uses discord.py, Supabase, python-dotenv and HTTPX.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium">
              4. Configure environment variables
            </h2>

            <p className="mb-3 text-sm leading-6 text-zinc-400">
              Create a{" "}
              <code className="rounded bg-zinc-900 px-1.5 py-0.5">.env</code>{" "}
              file in the project root.
            </p>

            <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-200">
              <code>{`DISCORD_TOKEN=your_discord_bot_token

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_service_role_key`}</code>
            </pre>

            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm font-medium text-zinc-200">
                Keep your credentials private
              </p>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Never commit your .env file, Discord bot token or Supabase
                service-role key to GitHub.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium">5. Configure Supabase</h2>

            <p className="mb-4 text-sm leading-6 text-zinc-400">
              SILENTRA Ticket Bot uses Supabase PostgreSQL to persist server
              configuration and ticket information.
            </p>

            <p className="mb-3 text-sm text-zinc-300">
              The database contains the following main tables:
            </p>

            <div className="space-y-3">
              <div className="rounded-lg border border-zinc-800 p-4">
                <code className="text-sm text-zinc-200">servers</code>
                <p className="mt-1 text-sm text-zinc-500">
                  Stores server-specific configuration such as the ticket
                  category, staff role, transcript channel and language.
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800 p-4">
                <code className="text-sm text-zinc-200">tickets</code>
                <p className="mt-1 text-sm text-zinc-500">
                  Stores ticket information such as the guild, channel, user,
                  subject and status.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium">
              6. Create and configure your Discord bot
            </h2>

            <p className="mb-4 text-sm leading-6 text-zinc-400">
              Create an application in the Discord Developer Portal, create a
              bot user and invite it to your server with the permissions
              required for ticket management.
            </p>

            <p className="mb-3 text-sm text-zinc-300">
              SILENTRA requires permissions for operations such as:
            </p>

            <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-400">
              <li>View channels</li>
              <li>Send messages</li>
              <li>Read message history</li>
              <li>Manage channels</li>
              <li>Manage messages</li>
              <li>Embed links</li>
              <li>Attach files</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium">7. Start the bot</h2>

            <p className="mb-3 text-sm leading-6 text-zinc-400">
              Once your environment is configured, start the bot with:
            </p>

            <pre className="mb-3 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-200">
              <code>python bot.py</code>
            </pre>

            <p className="text-sm leading-6 text-zinc-400">
              On startup, SILENTRA loads its cogs, translations, database
              connection and persistent Discord views before synchronizing its
              application commands.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium">8. Configure the bot</h2>

            <p className="mb-4 text-sm leading-6 text-zinc-400">
              Once the bot is online, use the following command inside your
              Discord server:
            </p>

            <pre className="mb-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-200">
              <code>/configure-bot</code>
            </pre>

            <p className="mb-3 text-sm text-zinc-300">You can configure:</p>

            <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-400">
              <li>Ticket category</li>
              <li>Administrator/staff role</li>
              <li>Transcript channel</li>
              <li>Server language</li>
              <li>Ticket panel</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium">
              9. Send the ticket panel
            </h2>

            <p className="text-sm leading-6 text-zinc-400">
              Open the configuration menu and select the option to send the
              ticket panel. Users can then interact with the panel to create
              private support tickets.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium">
              10. Create your first ticket
            </h2>

            <p className="mb-4 text-sm leading-6 text-zinc-400">
              When a user opens a ticket, SILENTRA validates the server
              configuration, creates a private channel, stores the ticket in
              Supabase and sends the ticket controls.
            </p>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm font-medium text-zinc-200">Ticket flow</p>

              <div className="mt-3 space-y-1 text-sm text-zinc-500">
                <p>Open ticket panel</p>
                <p>↓</p>
                <p>Enter ticket subject</p>
                <p>↓</p>
                <p>Validate configuration</p>
                <p>↓</p>
                <p>Create private channel</p>
                <p>↓</p>
                <p>Save ticket to Supabase</p>
                <p>↓</p>
                <p>Ticket ready</p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium">Persistent Views</h2>

            <p className="text-sm leading-6 text-zinc-400">
              Ticket buttons use Discord persistent views. This means ticket
              controls continue working after bot restarts because the views are
              registered again when the bot starts.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-lg font-medium">Supported Languages</h2>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-800 p-4">
                <p className="font-medium">English</p>
                <code className="text-sm text-zinc-500">en</code>
              </div>

              <div className="rounded-lg border border-zinc-800 p-4">
                <p className="font-medium">Português — Portugal</p>
                <code className="text-sm text-zinc-500">pt-PT</code>
              </div>

              <div className="rounded-lg border border-zinc-800 p-4">
                <p className="font-medium">Português — Brasil</p>
                <code className="text-sm text-zinc-500">pt-BR</code>
              </div>
            </div>
          </section>

          <div className="border-t border-zinc-800 pt-6">
            <p className="text-sm text-zinc-500">
              Need more information?{" "}
              <Link href="/docs" className="text-foreground hover:underline">
                Return to the documentation index
              </Link>
              .
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
