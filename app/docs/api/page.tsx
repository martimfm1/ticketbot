import Sidebar from "@/components/Sidebar";
import BackButton from "@/components/BackButton";

export default function APIReference() {
  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        <Sidebar />
        <main className="flex-1 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <BackButton />
            <h1 className="text-2xl font-semibold">API Reference (placeholder)</h1>
          </div>
          <p className="text-sm text-zinc-400 mb-4">This section will document server-side endpoints and SDK usage.</p>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2">Auth Callback</h2>
            <p className="text-sm text-zinc-400">POST /api/auth/discord/callback — handles Discord OAuth code exchange.</p>
          </section>

          <p className="text-sm text-zinc-500">Return to the <a href="/docs" className="text-foreground">documentation index</a>.</p>
        </main>
      </div>
    </div>
  );
}
