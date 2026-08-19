import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

import DashboardView from "./DashboardView";
import { getDashboardMetrics } from "@/lib/dashboard/dashboard.service";

export const dynamic = "force-dynamic";

const EMPTY_GUILD_ID = "000000000000000000";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.warn("[DashboardPage] No authenticated session; redirecting to login");
    redirect("/login");
  }

  const user = {
    id: session.user.id,
    name: session.user.name ?? "Utilizador",
    image: session.user.image ?? null,
  };

  let initialData;

  try {
    initialData = await getDashboardMetrics(EMPTY_GUILD_ID);
  } catch (error) {
    // Do not redirect back to /dashboard here: that creates a 307 loop
    // and hides the real data-loading failure from the user and logs.
    console.error("[DashboardPage] Failed to load initial dashboard data", {
      error,
      userId: session.user.id,
    });

    initialData = {
      servers: {
        total: 0,
        current: null,
      },
      tickets: {
        total: 0,
        open: 0,
        pending: 0,
        closed: 0,
        priorities: {
          low: 0,
          normal: 0,
          high: 0,
          urgent: 0,
        },
        recent: [],
      },
      suggestions: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        recent: [],
      },
    };
  }

  return <DashboardView user={user} initialData={initialData} />;
}
