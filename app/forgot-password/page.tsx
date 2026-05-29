"use client";

import Link from "next/link";
import { authApi, getApiErrorMessage, isApiConfigured } from "@/lib/api";
import { isAxiosError } from "axios";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

    if (!isApiConfigured()) {
      setError("프론트 환경변수(.env) 설정을 확인해주세요.");
      return;
    }
    if (!email.trim()) {
      setError("가입한 이메일을 입력해주세요.");
      return;
    }

    setSending(true);
    try {
      const data = await authApi.sendPasswordResetCode(email);
      setCodeSent(true);
      setSendCooldownLeft(SEND_CODE_COOLDOWN_SEC);
      setMessage(
        data?.devCode
          ? `${data?.message ?? "인증코드 발송 완료"} (개발코드: ${data.devCode})`
          : (data?.message ?? "인증코드 발송 완료"),
      );
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 429) {
        const msg = getApiErrorMessage(err);
        const matched = msg.match(/약 (\d+)초/);
        if (matched) {
          setSendCooldownLeft(Math.min(SEND_CODE_COOLDOWN_SEC, Number(matched[1])));
        }
      }
      setError(getApiErrorMessage(err, "인증코드 발송 중 오류가 발생했습니다."));
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async () => {
    setMessage("");
    setError("");

    if (!isApiConfigured()) {
      setError("프론트 환경변수(.env) 설정을 확인해주세요.");
      return;
    }
    if (!code.trim()) {
      setError("인증코드를 입력해주세요.");
      return;
    }

    setVerifying(true);
    try {
      const data = await authApi.verifyPasswordResetCode(email, code);
      setVerified(Boolean(data?.verified));
      setMessage("이메일 인증이 완료되었습니다. 새 비밀번호를 입력해주세요.");
    } catch (err) {
      setVerified(false);
      setError(getApiErrorMessage(err, "인증코드 확인 중 오류가 발생했습니다."));
    } finally {
      setVerifying(false);
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!isApiConfigured()) {
      setError("프론트 환경변수(.env) 설정을 확인해주세요.");
      return;
    }
    if (!verified) {
      setError("이메일 인증을 먼저 완료해주세요.");
      return;
    }

    setResetting(true);
    try {
      await authApi.resetPassword(email, newPassword);
      setMessage("비밀번호를 재설정했습니다. 로그인 화면으로 이동합니다.");
      window.setTimeout(() => router.push("/login"), 700);
    } catch (err) {
      setError(getApiErrorMessage(err, "비밀번호 재설정 중 오류가 발생했습니다."));
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 text-neutral-100">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6">
        <h1 className="text-xl font-semibold">비밀번호 찾기</h1>
        <p className="mt-2 text-sm text-neutral-400">
          가입한 이메일로 인증 후 새 비밀번호를 설정합니다.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-300">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-neutral-700 bg-black px-3 py-2"
              required
            />
          </label>

          <button
            type="button"
            onClick={() => void handleSendCode()}
            disabled={sending || sendCooldownLeft > 0}
            className="rounded-md border border-neutral-500 px-3 py-2 text-sm disabled:opacity-50"
          >
            {sendCooldownLeft > 0
              ? `재발송 (${sendCooldownLeft}초)`
              : sending
                ? "발송 중..."
                : "인증코드 발송"}
          </button>

          {codeSent ? (
            <>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-neutral-300">인증코드</span>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="rounded-md border border-neutral-700 bg-black px-3 py-2"
                />
              </label>
              <button
                type="button"
                onClick={() => void handleVerifyCode()}
                disabled={verifying}
                className="rounded-md border border-neutral-500 px-3 py-2 text-sm disabled:opacity-50"
              >
                {verifying ? "확인 중..." : "인증코드 확인"}
              </button>
            </>
          ) : null}

          {verified ? (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-neutral-300">새 비밀번호</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-md border border-neutral-700 bg-black px-3 py-2"
                  required
                  minLength={8}
                />
              </label>
              <button
                type="submit"
                disabled={resetting}
                className="rounded-md border border-sky-500 bg-sky-950/40 px-3 py-2 text-sm disabled:opacity-50"
              >
                {resetting ? "변경 중..." : "비밀번호 재설정"}
              </button>
            </form>
          ) : null}

          {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <Link href="/login" className="text-sm text-sky-400 hover:underline">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
