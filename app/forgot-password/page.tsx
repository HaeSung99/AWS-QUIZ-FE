"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const SEND_CODE_COOLDOWN_SEC = 120;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sendCooldownLeft, setSendCooldownLeft] = useState(0);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sendCooldownLeft <= 0) return undefined;
    const id = window.setInterval(() => {
      setSendCooldownLeft((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [sendCooldownLeft]);

  const handleSendCode = async () => {
    setMessage("");
    setError("");
    setVerified(false);

    if (!API_BASE_URL) {
      setError("프론트 환경변수(.env) 설정을 확인해주세요.");
      return;
    }
    if (!email.trim()) {
      setError("가입한 이메일을 입력해주세요.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/password/send-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 429 && typeof data?.message === "string") {
          const matched = data.message.match(/약 (\d+)초/);
          if (matched) {
            setSendCooldownLeft(Math.min(SEND_CODE_COOLDOWN_SEC, Number(matched[1])));
          }
        }
        throw new Error(data?.message ?? "인증코드 발송에 실패했습니다.");
      }

      setCodeSent(true);
      setSendCooldownLeft(SEND_CODE_COOLDOWN_SEC);
      setMessage(
        data?.devCode
          ? `${data?.message ?? "인증코드 발송 완료"} (개발코드: ${data.devCode})`
          : (data?.message ?? "인증코드 발송 완료"),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증코드 발송 중 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async () => {
    setMessage("");
    setError("");

    if (!API_BASE_URL) {
      setError("프론트 환경변수(.env) 설정을 확인해주세요.");
      return;
    }
    if (!code.trim()) {
      setError("인증코드를 입력해주세요.");
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/password/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "인증코드 확인에 실패했습니다.");
      }

      setVerified(Boolean(data?.verified));
      setMessage("이메일 인증이 완료되었습니다. 새 비밀번호를 입력해주세요.");
    } catch (err) {
      setVerified(false);
      setError(err instanceof Error ? err.message : "인증코드 확인 중 오류가 발생했습니다.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!API_BASE_URL) {
      setError("프론트 환경변수(.env) 설정을 확인해주세요.");
      return;
    }
    if (!verified) {
      setError("이메일 인증을 먼저 완료해주세요.");
      return;
    }

    setResetting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "비밀번호 재설정에 실패했습니다.");
      }

      setMessage("비밀번호를 재설정했습니다. 로그인 화면으로 이동합니다.");
      window.setTimeout(() => router.push("/login"), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "비밀번호 재설정 중 오류가 발생했습니다.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 text-neutral-100">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Password reset</p>
        <h1 className="mt-2 text-2xl font-semibold">비밀번호 찾기</h1>
        <p className="mt-2 text-sm text-neutral-400">
          가입한 이메일로 인증번호를 받은 뒤 새 비밀번호를 설정합니다.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <label className="text-xs font-medium text-neutral-400">가입 이메일</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setCodeSent(false);
                setVerified(false);
              }}
              placeholder="가입한 이메일"
              className="w-full rounded-xl border border-neutral-700 bg-black/70 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400"
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={sending || sendCooldownLeft > 0}
              className="min-w-[120px] rounded-xl border border-neutral-600 bg-neutral-900 px-3 py-2.5 text-sm transition hover:border-neutral-400 disabled:opacity-60"
            >
              {sending
                ? "발송 중..."
                : sendCooldownLeft > 0
                  ? `${sendCooldownLeft}초 후`
                  : "코드 발송"}
            </button>
          </div>

          <label className="mt-2 text-xs font-medium text-neutral-400">인증코드</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="인증코드 6자리"
              maxLength={6}
              disabled={!codeSent}
              className="w-full rounded-xl border border-neutral-700 bg-black/70 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={!codeSent || verifying || code.trim().length < 6}
              className="min-w-[120px] rounded-xl border border-sky-500/70 bg-sky-950/40 px-3 py-2.5 text-sm transition hover:border-sky-400 disabled:opacity-60"
            >
              {verifying ? "확인 중..." : "인증 확인"}
            </button>
          </div>
        </div>

        <form onSubmit={handleResetPassword} className="mt-5 flex flex-col gap-3">
          <label className="text-xs font-medium text-neutral-400">새 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호(6자 이상)"
            minLength={6}
            disabled={!verified}
            className="rounded-xl border border-neutral-700 bg-black/70 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 disabled:opacity-50"
            required
          />

          {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={!verified || resetting}
            className="rounded-xl border border-emerald-500/70 bg-emerald-950/40 px-3 py-2.5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400 disabled:opacity-60"
          >
            {resetting ? "변경 중..." : "비밀번호 재설정"}
          </button>
        </form>

        <div className="mt-5 flex justify-between text-sm">
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
