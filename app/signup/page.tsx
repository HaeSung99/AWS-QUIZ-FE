"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY;

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!API_BASE_URL || !ACCESS_TOKEN_KEY || !AUTH_USER_KEY) {
      setError("프론트 환경변수(.env) 설정을 확인해주세요.");
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
    <main className="flex flex-1 items-center justify-center px-4 py-10 text-neutral-100">
      <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-950/70 p-6">
        <h1 className="text-lg font-semibold">회원가입</h1>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm outline-none focus:border-neutral-400"
            required
          />
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
            placeholder="비밀번호(6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm outline-none focus:border-neutral-400"
            required
          />
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-md border border-amber-500/70 bg-amber-950/30 px-3 py-2 text-sm font-medium transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/login" className="text-sky-300 hover:underline">
            로그인
          </Link>
          <Link href="/" className="text-sky-400 hover:underline">
            메인으로
          </Link>
        </div>
      </div>
    </main>
  );
}
