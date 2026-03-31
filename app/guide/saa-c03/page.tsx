import Link from "next/link";

const SAA_GUIDE_LINKS = [
  { id: "saa-s3", label: "S3 가이드", href: "https://velog.io/@haesung/AWS-SAA-C03-S3" },
  {
    id: "saa-storage",
    label: "스토리지 가이드",
    href: "https://velog.io/@haesung/AWS-SAA-C03-스토리지",
  },
  {
    id: "saa-transfer",
    label: "데이터 전송 가이드",
    href: "https://velog.io/@haesung/AWS-SAA-C03-데이터-전송",
  },
  {
    id: "saa-database",
    label: "데이터베이스 가이드",
    href: "https://velog.io/@haesung/AWS-SAA-C03-데이터베이스",
  },
  {
    id: "saa-compute",
    label: "컴퓨팅 가이드",
    href: "https://velog.io/@haesung/AWS-SAA-C03-컴퓨팅",
  },
];

export default function SaaGuidePage() {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-neutral-100">
      <div className="mx-auto w-full max-w-4xl rounded-xl border border-neutral-700 bg-neutral-950/80 p-6">
        <h1 className="text-xl font-semibold">SAA-C03 가이드</h1>
        <p className="mt-2 text-sm text-neutral-400">
          아래 내용은 학습을 돕기 위한 참고용 가이드입니다.
        </p>

        <ul className="mt-5 space-y-2">
          {SAA_GUIDE_LINKS.map((guide) => (
            <li key={guide.id}>
              <Link
                href={guide.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-sky-300 transition hover:border-sky-500/60 hover:text-sky-200"
              >
                {guide.label}
              </Link>
            </li>
          ))}
        </ul>

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
