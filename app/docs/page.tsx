import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import BackButton from "@/components/BackButton";

export default function DocsIndex() {
  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        <Sidebar />
        <main className="flex-1 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <BackButton />
            <h1 className="text-3xl font-semibold">Documentation</h1>
          </div>
          <p className="text-sm text-zinc-400 mb-6">Guides and references to help you deploy and use SILENTRA Ticket.</p>

          <ul className="space-y-3">
            <li>
              <Link href="/docs/getting-started" className="text-foreground hover:underline">
                Getting Started
              </Link>
            </li>
            <li>
              <Link href="/docs/api" className="text-foreground hover:underline">
                API Reference
              </Link>
            </li>
            <li>
              <Link href="/docs/faq" className="text-foreground hover:underline">
                FAQ
              </Link>
            </li>
          </ul>
        </main>
      </div>
    </div>
  );
}
