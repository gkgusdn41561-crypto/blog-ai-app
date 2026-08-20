import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
      },
      success_url: `${origin}/premium?success=true`,
      cancel_url: `${origin}/premium?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "결제 세션 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}