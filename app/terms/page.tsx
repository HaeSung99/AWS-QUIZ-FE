import type { Metadata } from "next";
import Link from "next/link";
import { SITE_ORIGIN } from "@/lib/seo";

export const metadata: Metadata = {
  title: "이용약관",
  description: "AWS Quiz KR 서비스 이용약관. 이용 조건 및 책임 안내.",
  alternates: { canonical: `${SITE_ORIGIN}/terms` },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-neutral-100">
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-950/70 p-6">
        <h1 className="text-xl font-semibold">이용약관</h1>
        <p className="mt-3 text-sm text-neutral-300">
          본 약관은 AWS Quiz KR 서비스 이용과 관련한 기본 조건을 안내합니다.
        </p>
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-neutral-300">
          <section>
            <h2 className="font-medium text-neutral-100">1. 서비스 이용</h2>
            <p className="mt-1">
              회원은 관련 법령과 본 약관을 준수하여 서비스를 이용해야 하며, 타인의 권리를 침해하는
              행위를 해서는 안 됩니다.
            </p>
          </section>
          <section>
            <h2 className="font-medium text-neutral-100">2. 계정 관리</h2>
            <p className="mt-1">
              회원은 계정 정보와 인증 수단을 안전하게 관리해야 하며, 무단 사용이 의심되는 경우 즉시
              비밀번호 변경 등 필요한 조치를 해야 합니다.
            </p>
          </section>
          <section>
            <h2 className="font-medium text-neutral-100">3. 서비스 변경</h2>
            <p className="mt-1">
              서비스 품질 향상과 안정적인 운영을 위해 기능이 변경되거나 일부 서비스가 중단될 수
              있습니다.
            </p>
          </section>
          <section>
            <h2 className="font-medium text-neutral-100">4. 책임 제한</h2>
            <p className="mt-1">
              회사는 천재지변, 불가항력, 이용자 귀책 사유로 발생한 손해에 대해 관련 법령이 허용하는
              범위 내에서 책임을 제한할 수 있습니다.
            </p>
          </section>
        </div>
        <div className="mt-6">
          <Link href="/signup" className="text-sm text-sky-300 underline-offset-2 hover:underline">
            회원가입으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
