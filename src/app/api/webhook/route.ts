import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("웹훅 서명 검증 실패:", err);
    return NextResponse.json({ error: "잘못된 서명" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;

    if (userId) {
      await supabase
        .from("profiles")
        .upsert({ id: userId, is_premium: true });
    }
  }

  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.paused"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    );
    const email = (customer as Stripe.Customer).email;

    if (email) {
      const { data: authUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (authUser) {
        await supabase
          .from("profiles")
          .update({ is_premium: false })
          .eq("id", authUser.id);
      }
    }
  }

  return NextResponse.json({ received: true });
}