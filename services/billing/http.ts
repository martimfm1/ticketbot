import { NextResponse } from "next/server";
import { BillingError } from "@/types/billing";

export function billingErrorResponse(error: unknown) {
  const status = error instanceof BillingError
    ? error.code === "INVALID_PRICE" ? 400
      : error.code === "SUBSCRIPTION_NOT_FOUND" ? 404
      : error.code === "SUBSCRIPTION_NOT_ACTIVE" ? 409
      : error.code === "WEBHOOK_VERIFICATION_FAILED" ? 400
      : error.code === "BILLING_NOT_CONFIGURED" ? 503
      : 500
    : 500;

  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Billing request failed." },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
