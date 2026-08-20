import { redirect } from "next/navigation";
import { EmbeddedStripeCheckout } from "@/components/billing/embedded-stripe-checkout";

interface CheckoutPageProps {
  searchParams: Promise<{ guildId?: string; priceId?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  if (!params.guildId || !/^\d{17,20}$/.test(params.guildId) || !params.priceId) {
    redirect("/dashboard?tab=Billing");
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6 sm:py-10">
      <EmbeddedStripeCheckout guildId={params.guildId} />
    </main>
  );
}
