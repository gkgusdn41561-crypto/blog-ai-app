import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold mb-4">
        내 말투 그대로, 블로그 원고를 AI가 대신 써드려요
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-xl">
        기존에 쓴 글 몇 개만 넣으면 내 문체를 학습해서 새로운 원고를
        만들어줍니다. 무료로 시작하고, 무제한이 필요하면 프리미엄으로
        업그레이드하세요.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition"
        >
          무료로 시작하기
        </Link>
      </div>
    </main>
  );
}
