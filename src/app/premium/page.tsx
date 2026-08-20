"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function PremiumContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const handleUpgrade = async () => {
    setLoading(true);

    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error ?? "오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {success && (
        <p className="mb-4 text-green-600 font-medium">
          결제가 완료됐어요! 프리미엄 기능을 이용하실 수 있어요.
        </p>
      )}
      {canceled && (
        <p className="mb-4 text-gray-500">결제가 취소되었어요.</p>
      )}

      <h1 className="text-3xl font-bold mb-3">프리미엄으로 업그레이드</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        무제한 원고 생성, 문체 학습, 플랫폼별 최적화까지 — 프리미엄에서
        모두 이용하실 수 있어요.
      </p>

      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-black text-white rounded-md px-8 py-3 font-medium hover:bg-gray-800 transition disabled:opacity-50"
      >
        {loading ? "이동 중..." : "프리미엄 시작하기"}
      </button>
    </main>
  );
}

export default function PremiumPage() {
  return (
    <Suspense fallback={null}>
      <PremiumContent />
    </Suspense>
  );
}