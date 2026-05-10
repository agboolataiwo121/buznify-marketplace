import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-04-22.dahlia" });
  }
  return _stripe;
}

export interface CreateCheckoutSessionParams {
  amountUsd: number;       // e.g. 10.00
  userId: number;
  userEmail: string;
  userName?: string;
  reference: string;       // internal payment reference for idempotency
  successUrl: string;
  cancelUrl: string;
}

export async function createStripeCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripe();
  const amountCents = Math.round(params.amountUsd * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: params.userEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: "Buznify Wallet Top-up",
            description: `Add $${params.amountUsd.toFixed(2)} to your Buznify wallet`,
          },
        },
        quantity: 1,
      },
    ],
    client_reference_id: String(params.userId),
    metadata: {
      user_id: String(params.userId),
      customer_email: params.userEmail,
      customer_name: params.userName ?? "",
      reference: params.reference,
      amount_usd: String(params.amountUsd),
    },
    allow_promotion_codes: true,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  return { sessionId: session.id, url: session.url! };
}
