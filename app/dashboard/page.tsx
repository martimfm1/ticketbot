import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

import DashboardView from "./DashboardView";
import { getDashboardMetrics } from "@/lib/dashboard/dashboard.service";

export const dynamic = "force-dynamic";

const DEFAULT_GUILD_ID = "000000000000000000";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = {
    id: session.user.id,
    name: session.user.name ?? "Utilizador",
    image: session.user.image ?? null,
  };
  try {
    const initialData = await getDashboardMetrics(DEFAULT_GUILD_ID);

    return <DashboardView user={user} initialData={initialData} />;
  } catch (error) {
    console.error("[DashboardPage] Failed to load dashboard", error);

    redirect("/dashboard?error=failed-to-load");
  }
}
