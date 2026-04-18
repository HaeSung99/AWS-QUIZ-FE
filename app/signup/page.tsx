"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
/** 백엔드 `EMAIL_RESEND_COOLDOWN_MS`(120초)와 동일하게 유지 */
const SEND_CODE_COOLDOWN_SEC = 120;
const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY;

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [sendCooldownLeft, setSendCooldownLeft] = useState(0);

  useEffect(() => {
    if (sendCooldownLeft <= 0) return undefined;
    const id = window.setInterval(() => {
      setSendCooldownLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [sendCooldownLeft > 0]);

  const handleSendCode = async () => {
    setError("");
    setVerificationMessage("");
    setIsEmailVerified(false);

    if (!API_BASE_URL) {
      setError("프론트 환경변수(.env) 설정을 확인해주세요.");
      return;
    }
    if (!email.trim()) {
      setError("이메일을 먼저 입력해주세요.");
      return;
    }

    setSendingCode(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/email/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 429 && typeof data?.message === "string") {
          const m = data.message.match(/약 (\d+)초/);
          if (m) {
            setSendCooldownLeft(Math.min(SEND_CODE_COOLDOWN_SEC, Math.max(1, parseInt(m[1], 10))));
          }
        }
        throw new Error(
          Array.isArray(data?.message) ? data.message.join(", ") : (data?.message ?? "인증코드 발송 실패"),
        );
      }
      setCodeSent(true);
      setSendCooldownLeft(SEND_CODE_COOLDOWN_SEC);
      setVerificationMessage(
        data?.devCode
          ? `${data?.message ?? "인증코드 발송 완료"} (개발코드: ${data.devCode})`
          : (data?.message ?? "인증코드 발송 완료"),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증코드 발송 중 오류가 발생했습니다.");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    setVerificationMessage("");

    if (!API_BASE_URL) {
      setError("프론트 환경변수(.env) 설정을 확인해주세요.");
      return;
    }
    if (!email.trim()) {
      setError("이메일을 먼저 입력해주세요.");
      return;
    }
    if (!verificationCode.trim()) {
      setError("인증코드를 입력해주세요.");
      return;
    }

    setVerifyingCode(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/email/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "이메일 인증 실패");
      }
      setIsEmailVerified(Boolean(data?.verified));
      setVerificationMessage("이메일 인증이 완료되었습니다.");
    } catch (err) {
      setIsEmailVerified(false);
      setError(err instanceof Error ? err.message : "이메일 인증 중 오류가 발생했습니다.");
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!API_BASE_URL || !ACCESS_TOKEN_KEY || !AUTH_USER_KEY) {
      setError("프론트 환경변수(.env) 설정을 확인해주세요.");
      setLoading(false);
      return;
    }
    if (!isEmailVerified) {
      setError("이메일 인증을 먼저 완료해주세요.");
      setLoading(false);
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError("이용약관 및 개인정보 수집·이용에 동의해주세요.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "회원가입에 실패했습니다.");
      }

      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-10 text-neutral-100">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-900 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">AWS 문풀</p>
            <h1 className="mt-2 text-2xl font-semibold">회원가입</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-400">이름</label>
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-black/70 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-400">이메일</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailVerified(false);
                  setCodeSent(false);
                  setSendCooldownLeft(0);
                }}
                className="w-full rounded-xl border border-neutral-700 bg-black/70 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400"
                required
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode || sendCooldownLeft > 0}
                className="min-w-[108px] shrink-0 whitespace-nowrap cursor-pointer rounded-xl border border-neutral-600 bg-neutral-900 px-3 py-2.5 text-sm transition hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingCode
                  ? "발송 중..."
                  : sendCooldownLeft > 0
                    ? `${sendCooldownLeft}초 후 재발송`
                    : "코드 발송"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-400">인증코드</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                placeholder="인증코드 6자리"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-black/70 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 disabled:opacity-50"
                disabled={!codeSent}
                maxLength={6}
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={!codeSent || verifyingCode || verificationCode.trim().length < 6}
                className="min-w-[108px] shrink-0 whitespace-nowrap cursor-pointer rounded-xl border border-sky-500/70 bg-sky-950/30 px-3 py-2.5 text-sm transition hover:border-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifyingCode ? "확인 중..." : "인증 확인"}
              </button>
            </div>
          </div>

          {verificationMessage ? (
            <p className={`text-sm ${isEmailVerified ? "text-emerald-400" : "text-neutral-300"}`}>
              {verificationMessage}
            </p>
          ) : null}

          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-400">비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호(6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-black/70 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400"
              required
            />
          </div>

          <div className="rounded-xl border border-neutral-800 bg-black/40 p-3 text-xs text-neutral-300">
            <p className="font-medium text-neutral-200">개인정보 수집·이용 안내</p>
            <p className="mt-1 leading-relaxed text-neutral-400">
              수집항목: 이름, 이메일, 비밀번호(암호화), 서비스 이용기록(문제풀이/정오답/접속로그).
              수집목적: 회원 식별, 로그인/인증, 서비스 제공, 통계 분석 및 사이트 기능 개선.
              보관기간: 회원 탈퇴 시까지(관계 법령에 따라 일부 정보는 별도 보관될 수 있음).
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950/40 px-2.5 py-2">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>[필수] 이용약관에 동의합니다.</span>
                </label>
                <Link
                  href="/terms"
                  target="_blank"
                  className="shrink-0 text-[11px] text-sky-300 underline-offset-2 hover:underline"
                >
                  자세히보기
                </Link>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950/40 px-2.5 py-2">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>[필수] 개인정보 수집·이용에 동의합니다.</span>
                </label>
                <Link
                  href="/privacy"
                  target="_blank"
                  className="shrink-0 text-[11px] text-sky-300 underline-offset-2 hover:underline"
                >
                  자세히보기
                </Link>
              </div>
            </div>
          </div>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || !isEmailVerified || !agreeTerms || !agreePrivacy}
            className="cursor-pointer rounded-xl border border-amber-500/70 bg-amber-950/40 px-3 py-2.5 text-sm font-semibold transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "가입 중..." : "회원가입 완료"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/login" className="text-sky-300 underline-offset-2 hover:underline">
            로그인으로 이동
          </Link>
          <Link href="/" className="text-sky-400 underline-offset-2 hover:underline">
            메인으로
          </Link>
        </div>
      </div>
    </main>
  );
}
