import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

import type { DashboardMetrics } from "@/types/dashboard";
import DashboardView from "./DashboardView";

export const dynamic = "force-dynamic";

const EMPTY_DASHBOARD: DashboardMetrics = {
  servers: {
    total: 0,
    current: null,
  },
  tickets: {
    total: 0,
    open: 0,
    closed: 0,
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

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = {
    id: session.user.id,
    name: session.user.name ?? "User",
    image: session.user.image ?? null,
  };

  return <DashboardView user={user} initialData={EMPTY_DASHBOARD} />;
}
