"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">로그인</h1>

        {sent ? (
          <p className="text-center text-gray-600">
            {email} 주소로 로그인 링크를 보냈어요. 메일함을 확인해주세요.
          </p>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-md px-4 py-2"
            />
            <button
              type="submit"
              className="bg-black text-white rounded-md px-4 py-2 font-medium hover:bg-gray-800 transition"
            >
              로그인 링크 받기
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
