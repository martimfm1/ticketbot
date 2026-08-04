import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardView from "./DashboardView";
import { getFullDashboardData } from "@/lib/dashboard-service";


export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = {
    id: (session.user as any).id || "000000000000000000",
    name: session.user.name ?? "Utilizador",
    image: session.user.image ?? null,
  };

  const defaultGuildId = "1303728329689399297";
  const data = await getFullDashboardData(defaultGuildId);

  // Alterado de data={data} para initialData={data}
  return <DashboardView user={user} initialData={data} />;
}
