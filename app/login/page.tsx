"use client";

import { saveAuthSession } from "@/lib/auth-client";
import { authApi, getApiErrorMessage, isAuthStorageConfigured } from "@/lib/api";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isAuthStorageConfigured()) {
      setError("프론트 환경변수(.env) 설정을 확인해주세요.");
      setLoading(false);
      return;
    }

    try {
      const data = await authApi.login({ email, password });
      saveAuthSession(data);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(getApiErrorMessage(err, "로그인 중 오류가 발생했습니다."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 text-neutral-100">
      <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-950/70 p-6">
        <h1 className="text-lg font-semibold">로그인</h1>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm outline-none focus:border-neutral-400"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm outline-none focus:border-neutral-400"
            required
          />
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-md border border-neutral-500 px-3 py-2 text-sm font-medium transition hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/signup" className="text-amber-300 hover:underline">
            회원가입
          </Link>
          <Link href="/forgot-password" className="text-sky-300 hover:underline">
            비밀번호 찾기
          </Link>
        </div>
        <Link href="/" className="mt-3 block text-right text-sm text-sky-400 hover:underline">
          메인으로
        </Link>
      </div>
    </main>
  );
}
