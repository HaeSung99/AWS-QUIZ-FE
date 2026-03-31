import Link from "next/link";

export default function ClfGuidePage() {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-neutral-100">
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-neutral-700 bg-neutral-950/80 p-6 text-center">
        <h1 className="text-xl font-semibold">CLF-C02 가이드</h1>
        <p className="mt-3 text-sm text-neutral-400">준비중입니다.</p>
        <p className="mt-1 text-xs text-neutral-500">
          추후 Cloud 기본 개념/요금/보안/공유 책임 모델 중심으로 업데이트할 예정입니다.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-md border border-neutral-600 px-3 py-2 text-sm text-neutral-200 hover:border-neutral-500"
        >
          ← 메인으로
        </Link>
      </div>
    </main>
  );
}
