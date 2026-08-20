"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

type Post = {
  id: string;
  topic: string;
  content: string;
  created_at: string;
};

export default function DashboardPage() {
  const [topic, setTopic] = useState("");
  const [styleSample, setStyleSample] = useState("");
  const [styleSaved, setStyleSaved] = useState(false);
  const [styleEditing, setStyleEditing] = useState(false);
  const [savingStyle, setSavingStyle] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [limitReached, setLimitReached] = useState(false);

  const supabase = createClient();

  const loadPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data as Post[]);
  };

  const loadStyle = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("style_sample")
      .eq("id", user.id)
      .maybeSingle();

    if (data?.style_sample) {
      setStyleSample(data.style_sample);
      setStyleSaved(true);
    } else {
      setStyleEditing(true);
    }
  };

  useEffect(() => {
    loadPosts();
    loadStyle();
  }, []);

  const handleSaveStyle = async () => {
    setSavingStyle(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("로그인이 필요합니다.");
      setSavingStyle(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, email: user.email, style_sample: styleSample });

    if (error) {
      alert("문체 저장 중 오류가 발생했습니다: " + error.message);
    } else {
      setStyleSaved(true);
      setStyleEditing(false);
    }

    setSavingStyle(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");
    setSaved(false);
    setLimitReached(false);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, sampleWriting: styleSample }),
    });

    const data = await res.json();

    if (data.limitReached) {
      setLimitReached(true);
      setResult("");
    } else {
      setResult(data.content ?? data.error ?? "오류가 발생했습니다.");
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("로그인이 필요합니다.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      topic,
      content: result,
    });

    if (error) {
      alert("저장 중 오류가 발생했습니다: " + error.message);
    } else {
      setSaved(true);
      loadPosts();
    }

    setSaving(false);
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">블로그 원고 생성</h1>

      <div className="mb-8 border rounded-md p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">내 문체</h2>
          {styleSaved && !styleEditing && (
            <button
              onClick={() => setStyleEditing(true)}
              className="text-sm text-gray-500 underline"
            >
              수정하기
            </button>
          )}
        </div>

        {styleEditing ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">
              평소 쓰던 글을 한 번만 넣어두면, 앞으로 원고를 생성할 때마다
              자동으로 이 말투를 따라 써드려요.
            </p>
            <textarea
              value={styleSample}
              onChange={(e) => setStyleSample(e.target.value)}
              placeholder="이전에 쓴 블로그 글을 붙여넣어보세요"
              rows={6}
              className="w-full border rounded-md px-4 py-2"
            />
            <button
              onClick={handleSaveStyle}
              disabled={savingStyle || !styleSample}
              className="self-start bg-black text-white rounded-md px-4 py-2 font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {savingStyle ? "저장 중..." : "이 문체로 저장하기"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            문체가 저장되어 있어요. 이제부터 원고 생성 시 자동으로 이 말투가
            적용돼요.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">글 주제</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: 가을철 캠핑 준비물 추천"
            className="w-full border rounded-md px-4 py-2"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic}
          className="bg-black text-white rounded-md px-4 py-2 font-medium hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "작성 중..." : "원고 생성하기"}
        </button>

        {limitReached && (
          <div className="border border-orange-300 bg-orange-50 rounded-md p-4 flex flex-col gap-3">
            <p className="text-orange-800">
              무료 플랜은 월 3편까지만 생성할 수 있어요. 프리미엄으로
              업그레이드하면 무제한으로 쓸 수 있어요.
            </p>
            <Link
              href="/premium"
              className="self-start bg-black text-white rounded-md px-4 py-2 font-medium hover:bg-gray-800 transition"
            >
              프리미엄 알아보기
            </Link>
          </div>
        )}

        {result && (
          <div className="mt-2 flex flex-col gap-3">
            <div className="border rounded-md p-4 whitespace-pre-wrap bg-white">
              {result}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="self-start bg-white border border-black text-black rounded-md px-4 py-2 font-medium hover:bg-gray-100 transition disabled:opacity-50"
            >
              {saved ? "저장됨 ✓" : saving ? "저장 중..." : "이 글 저장하기"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">저장된 글</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500">아직 저장된 글이 없어요.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <details
                key={post.id}
                className="border rounded-md p-4 bg-white"
              >
                <summary className="cursor-pointer font-medium">
                  {post.topic}{" "}
                  <span className="text-gray-400 text-sm">
                    ({new Date(post.created_at).toLocaleDateString("ko-KR")})
                  </span>
                </summary>
                <div className="mt-3 whitespace-pre-wrap text-sm">
                  {post.content}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}