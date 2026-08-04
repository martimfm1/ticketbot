import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import BackButton from "@/components/BackButton";

export default function GettingStarted() {
  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        <Sidebar />
        <main className="flex-1 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <BackButton />
            <h1 className="text-2xl font-semibold">Getting Started</h1>
          </div>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2">1. Install</h2>
            <pre className="bg-zinc-900 rounded p-3 text-sm mb-2">pnpm install</pre>
            <p className="text-sm text-zinc-400">Install dependencies and prepare your environment.</p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2">2. Add the Bot to Discord</h2>
            <p className="text-sm text-zinc-400">Use the OAuth2 URL from your Discord application to add the bot to your server.</p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2">3. Configure Environment</h2>
            <p className="text-sm text-zinc-400 mb-2">Create a <code className="bg-zinc-900 px-1 rounded">.env.local</code> with:</p>
            <ul className="list-disc pl-5 text-sm text-zinc-400">
              <li>DISCORD_CLIENT_ID</li>
              <li>DISCORD_CLIENT_SECRET</li>
              <li>NEXT_PUBLIC_DISCORD_CLIENT_ID</li>
              <li>NEXT_PUBLIC_SITE_URL (optional)</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2">4. Run</h2>
            <pre className="bg-zinc-900 rounded p-3 text-sm mb-2">pnpm dev</pre>
            <p className="text-sm text-zinc-400">Open <code className="bg-zinc-900 px-1 rounded">http://localhost:3000</code> and sign in.</p>
          </section>

          <p className="text-sm text-zinc-500">Return to the <Link href="/docs" className="text-foreground hover:underline">documentation index</Link>.</p>
        </main>
      </div>
    </div>
  );
}
