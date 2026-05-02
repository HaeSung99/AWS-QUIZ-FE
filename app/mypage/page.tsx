"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY;
const TARGET_CERT_NONE = "";
const AWS_CERTIFICATION_OPTIONS = [
  "SAA-C03",
  "CLF-C02",
  "DVA-C02",
  "SOA-C02",
  "SAP-C02",
  "DOP-C02",
  "SCS-C02",
  "ANS-C01",
  "MLS-C01",
  "DEA-C01",
  "AIF-C01",
] as const;
const AWS_CERTIFICATION_LABELS: Record<string, string> = {
  "": "정하지 않음",
  "SAA-C03": "SAA-C03 - Solutions Architect Associate",
  "CLF-C02": "CLF-C02 - Cloud Practitioner",
  "DVA-C02": "DVA-C02 - Developer Associate",
  "SOA-C02": "SOA-C02 - SysOps Administrator Associate",
  "SAP-C02": "SAP-C02 - Solutions Architect Professional",
  "DOP-C02": "DOP-C02 - DevOps Engineer Professional",
  "SCS-C02": "SCS-C02 - Security Specialty",
  "ANS-C01": "ANS-C01 - Advanced Networking Specialty",
  "MLS-C01": "MLS-C01 - Machine Learning Specialty",
  "DEA-C01": "DEA-C01 - Data Engineer Associate",
  "AIF-C01": "AIF-C01 - AI Practitioner",
};

type UserProfile = {
  id: number;
  email: string;
  name: string;
  role: string;
  targetCertificationType?: string | null;
  solvedWorkbookIds?: string[];
};

function getAuthHeaders() {
  if (typeof window === "undefined" || !ACCESS_TOKEN_KEY) return null;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return null;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export default function MyPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [targetCertificationType, setTargetCertificationType] = useState(TARGET_CERT_NONE);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [certSaving, setCertSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      const headers = getAuthHeaders();
      if (!API_BASE_URL || !headers) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, { headers });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message ?? "프로필을 불러오지 못했습니다.");
        }
        const user = data.user as UserProfile;
        setProfile(user);
        setTargetCertificationType(user.targetCertificationType ?? TARGET_CERT_NONE);
        if (AUTH_USER_KEY) {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "프로필 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveCertification = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const headers = getAuthHeaders();
    if (!API_BASE_URL || !headers) {
      setError("로그인이 필요합니다.");
      return;
    }

    setCertSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me/target-certification`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          targetCertificationType: targetCertificationType || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "목표 자격증 저장에 실패했습니다.");
      }

      setProfile(data.user);
      setTargetCertificationType(data.user.targetCertificationType ?? TARGET_CERT_NONE);
      if (AUTH_USER_KEY) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        window.dispatchEvent(new StorageEvent("storage", { key: AUTH_USER_KEY }));
      }
      setMessage("목표 자격증을 저장했습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "목표 자격증 저장 중 오류가 발생했습니다.");
    } finally {
      setCertSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const headers = getAuthHeaders();
    if (!API_BASE_URL || !headers) {
      setError("로그인이 필요합니다.");
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me/password`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "비밀번호 변경에 실패했습니다.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setMessage("비밀번호를 변경했습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-neutral-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Account</p>
            <h1 className="mt-2 text-3xl font-semibold">마이페이지</h1>
            <p className="mt-2 text-sm text-neutral-400">
              목표 자격증과 계정 정보를 관리합니다.
            </p>
          </div>
          <Link href="/" className="text-sm text-sky-300 underline-offset-2 hover:underline">
            홈으로 돌아가기
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 text-sm text-neutral-400">
            계정 정보를 불러오는 중입니다.
          </div>
        ) : null}

        {profile ? (
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5">
              <p className="text-xs text-neutral-500">이메일</p>
              <p className="mt-2 font-medium">{profile.email}</p>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5">
              <p className="text-xs text-neutral-500">이름 / 권한</p>
              <p className="mt-2 font-medium">
                {profile.name} · {profile.role}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5">
              <p className="text-xs text-neutral-500">완료 문제집</p>
              <p className="mt-2 font-medium">{profile.solvedWorkbookIds?.length ?? 0}개</p>
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 md:grid-cols-2">
          <form
            onSubmit={handleSaveCertification}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5"
          >
            <h2 className="text-lg font-semibold">목표 자격증</h2>
            <p className="mt-1 text-sm text-neutral-400">
              오늘의 문제는 이 자격증을 기준으로 제공됩니다.
            </p>
            <select
              value={targetCertificationType}
              onChange={(e) => setTargetCertificationType(e.target.value)}
              className="mt-4 w-full rounded-xl border border-neutral-700 bg-black/70 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400"
            >
              <option value={TARGET_CERT_NONE}>{AWS_CERTIFICATION_LABELS[TARGET_CERT_NONE]}</option>
              {AWS_CERTIFICATION_OPTIONS.map((cert) => (
                <option key={cert} value={cert}>
                  {AWS_CERTIFICATION_LABELS[cert]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={certSaving}
              className="mt-4 w-full rounded-xl border border-sky-500/70 bg-sky-950/40 px-3 py-2.5 text-sm font-semibold text-sky-100 transition hover:border-sky-400 disabled:opacity-60"
            >
              {certSaving ? "저장 중..." : "목표 자격증 저장"}
            </button>
          </form>

          <form
            onSubmit={handleChangePassword}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5"
          >
            <h2 className="text-lg font-semibold">비밀번호 변경</h2>
            <p className="mt-1 text-sm text-neutral-400">
              현재 비밀번호 확인 후 새 비밀번호로 변경합니다.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호"
                className="w-full rounded-xl border border-neutral-700 bg-black/70 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400"
                required
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호(6자 이상)"
                minLength={6}
                className="w-full rounded-xl border border-neutral-700 bg-black/70 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={passwordSaving}
              className="mt-4 w-full rounded-xl border border-emerald-500/70 bg-emerald-950/40 px-3 py-2.5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400 disabled:opacity-60"
            >
              {passwordSaving ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        </section>

        {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </div>
    </main>
  );
}
