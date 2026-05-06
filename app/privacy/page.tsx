import type { Metadata } from "next";
import Link from "next/link";
import { SITE_ORIGIN } from "@/lib/seo";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "AWS Quiz KR 개인정보처리방침. 수집 항목·목적, 보관 및 파기, 이용자 권리 안내.",
  alternates: { canonical: `${SITE_ORIGIN}/privacy` },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-neutral-100">
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-950/70 p-6">
        <h1 className="text-xl font-semibold">개인정보처리방침</h1>
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-neutral-300">
          <section>
            <h2 className="font-medium text-neutral-100">1. 수집 항목</h2>
            <p className="mt-1">
              이름, 이메일, 비밀번호(암호화), 문제풀이 결과(정오답/풀이 이력), 접속 로그를 수집할 수
              있습니다.
            </p>
          </section>
          <section>
            <h2 className="font-medium text-neutral-100">2. 수집 목적</h2>
            <p className="mt-1">
              회원 식별, 로그인 및 이메일 인증, 문제풀이 서비스 제공, 통계 분석 및 사이트 기능 개선을
              위해 개인정보를 처리합니다.
            </p>
          </section>
          <section>
            <h2 className="font-medium text-neutral-100">3. 보관 및 파기</h2>
            <p className="mt-1">
              원칙적으로 회원 탈퇴 시 지체 없이 파기하며, 관계 법령에 따라 보관이 필요한 경우 해당
              기간 동안 별도 보관 후 파기합니다.
            </p>
          </section>
          <section>
            <h2 className="font-medium text-neutral-100">4. 이용자 권리</h2>
            <p className="mt-1">
              이용자는 개인정보 열람, 정정, 삭제, 처리정지 등을 요청할 수 있으며, 서비스 운영 정책과
              관련 법령에 따라 처리됩니다.
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
