import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const FREE_MONTHLY_LIMIT = 3;

export async function POST(req: NextRequest) {
  try {
    const { topic, sampleWriting } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: "topic(주제)은 필수입니다." },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 로그인한 사용자라면, 무료 사용자의 이번 달 생성 횟수를 체크
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .maybeSingle();

      const isPremium = profile?.is_premium ?? false;

      if (!isPremium) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", startOfMonth.toISOString());

        if ((count ?? 0) >= FREE_MONTHLY_LIMIT) {
          return NextResponse.json(
            {
              error: `무료 플랜은 월 ${FREE_MONTHLY_LIMIT}편까지만 생성할 수 있어요. 프리미엄으로 업그레이드하면 무제한으로 쓸 수 있어요.`,
              limitReached: true,
            },
            { status: 403 }
          );
        }
      }
    }

    // sampleWriting(기존 글)이 있으면 few-shot으로 문체를 학습시켜 생성
    const systemPrompt = sampleWriting
      ? `당신은 블로그 원고 작성 도우미입니다. 아래는 사용자가 이전에 쓴 글입니다. 이 글의 말투, 어휘 선택, 문장 길이, 톤을 최대한 그대로 따라서 새 글을 작성하세요.\n\n---기존 글 예시---\n${sampleWriting}\n---예시 끝---`
      : `당신은 블로그 원고 작성 도우미입니다. 자연스럽고 읽기 쉬운 한국어 블로그 글을 작성하세요.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `다음 주제로 블로그 원고를 작성해주세요: "${topic}"`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");

    return NextResponse.json({
      content: textBlock && "text" in textBlock ? textBlock.text : "",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "원고 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}