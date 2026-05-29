"use client";

import {
  authApi,
  isApiConfigured,
  publicApi,
  userApi,
  getApiErrorMessage,
  type LearningStats,
  type UserProfile,
  type WorkbookBrief,
  type WorkbookReview,
  type WorkbookAccuracy as WorkbookAccuracyRow,
} from "@/lib/api";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AUTH_USER_KEY, getAccessToken, getRefreshToken, notifyAuthStorageChanged } from "@/lib/auth-client";
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

function formatChoiceLine(
  choices: string[],
  answer: string | null | undefined,
): string {
  if (answer === null || answer === undefined || answer === "") return "미응답";
  const idx = choices.findIndex((c) => c === answer);
  if (idx < 0) return answer;
  return `${idx + 1}. ${answer}`;
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
  const [learningStats, setLearningStats] = useState<LearningStats | null>(
    null,
  );
  const [extrasLoading, setExtrasLoading] = useState(false);
  const [publicWorkbooks, setPublicWorkbooks] = useState<WorkbookBrief[]>([]);
  const [crowdAccuracy, setCrowdAccuracy] = useState<
    Record<string, WorkbookAccuracyRow>
  >({});
  const [reviewWorkbookId, setReviewWorkbookId] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<WorkbookReview | null>(
    null,
  );
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewModalError, setReviewModalError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      if (!isApiConfigured() || (!getAccessToken() && !getRefreshToken())) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      try {
        const { user } = await authApi.me();
        setProfile(user);
        setTargetCertificationType(user.targetCertificationType ?? TARGET_CERT_NONE);
        if (AUTH_USER_KEY) {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "프로필 조회 중 오류가 발생했습니다."));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!isApiConfigured() || !profile) return;
    let cancelled = false;

    void (async () => {
      setExtrasLoading(true);
      try {
        const [statsRes, wbRes, accRes] = await Promise.all([
          userApi.getLearningStats(),
          publicApi.getWorkbooks(),
          publicApi.getWorkbookAccuracy(),
        ]);
        if (cancelled) return;
        setLearningStats(statsRes);
        setPublicWorkbooks(
          Array.isArray(wbRes)
            ? wbRes.map((w) => ({
                id: w.id,
                title: w.title,
                certificationType: w.certificationType,
              }))
            : [],
        );

        const accMap: Record<string, WorkbookAccuracyRow> = {};
        for (const r of Array.isArray(accRes) ? accRes : []) {
          accMap[r.workbookId] = r;
        }
        setCrowdAccuracy(accMap);
      } catch {
        if (!cancelled) {
          setLearningStats({
            overall: { totalCount: 0, correctCount: 0, accuracy: null },
            workbooks: [],
          });
          setPublicWorkbooks([]);
          setCrowdAccuracy({});
        }
      } finally {
        if (!cancelled) setExtrasLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const solvedRows = useMemo(() => {
    const ids = [...new Set(profile?.solvedWorkbookIds ?? [])];
    const pubMap = new Map(publicWorkbooks.map((w) => [w.id, w]));
    const mineMap = new Map(
      (learningStats?.workbooks ?? []).map((w) => [w.workbookId, w]),
    );
    ids.sort((a, b) => {
      const ta = pubMap.get(a)?.title ?? mineMap.get(a)?.title ?? a;
      const tb = pubMap.get(b)?.title ?? mineMap.get(b)?.title ?? b;
      return ta.localeCompare(tb, "ko");
    });

    return ids.map((id) => {
      const pb = pubMap.get(id);
      const mine = mineMap.get(id);
      return {
        id,
        title: pb?.title ?? mine?.title ?? id,
        certificationType: pb?.certificationType,
        crowd: crowdAccuracy[id],
        mine,
      };
    });
  }, [profile?.solvedWorkbookIds, publicWorkbooks, crowdAccuracy, learningStats]);

  const closeReviewModal = useCallback(() => {
    setReviewWorkbookId(null);
    setReviewData(null);
    setReviewLoading(false);
    setReviewModalError(null);
  }, []);

  const openReviewForWorkbook = useCallback(async (wid: string) => {
    if (!isApiConfigured()) return;
    setReviewModalError(null);
    setReviewWorkbookId(wid);
    setReviewData(null);
    setReviewLoading(true);
    try {
      const payload = await userApi.getWorkbookReview(wid);
      if (!payload.sessions?.length) {
        setReviewModalError(
          "저장된 문항 채점 기록이 없습니다. 해당 문제집을 다시 한 번 제출하면 여기에서 확인할 수 있습니다.",
        );
      }
      setReviewData(payload);
    } catch (e) {
      setReviewModalError(getApiErrorMessage(e, "채점 내역을 불러오지 못했습니다."));
      setReviewData(null);
    } finally {
      setReviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!reviewWorkbookId) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeReviewModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reviewWorkbookId, closeReviewModal]);

  const handleSaveCertification = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!isApiConfigured()) {
      setError("로그인이 필요합니다.");
      return;
    }

    setCertSaving(true);
    try {
      const { user } = await authApi.updateTargetCertification(
        targetCertificationType || null,
      );

      setProfile(user);
      setTargetCertificationType(user.targetCertificationType ?? TARGET_CERT_NONE);
      if (AUTH_USER_KEY) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        notifyAuthStorageChanged();
      }
      setMessage("목표 자격증을 저장했습니다.");
    } catch (err) {
      setError(getApiErrorMessage(err, "목표 자격증 저장 중 오류가 발생했습니다."));
    } finally {
      setCertSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!isApiConfigured()) {
      setError("로그인이 필요합니다.");
      return;
    }

    setPasswordSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setMessage("비밀번호를 변경했습니다.");
    } catch (err) {
      setError(getApiErrorMessage(err, "비밀번호 변경 중 오류가 발생했습니다."));
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
              목표 자격증과 계정·학습 기록을 관리합니다.
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

        {profile && learningStats ? (
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5">
            <h2 className="text-lg font-semibold">나의 학습 현황</h2>
            <p className="mt-1 text-sm text-neutral-400">
              유형별·문제집 연습 포함, 저장된 모든 선택 응답 기준 통합 정답률입니다.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-800 bg-black/40 px-4 py-3">
                <p className="text-xs text-neutral-500">통합 정답률</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-300">
                  {learningStats.overall.totalCount === 0
                    ? "-"
                    : learningStats.overall.accuracy !== null
                      ? `${learningStats.overall.accuracy}%`
                      : "-"}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-black/40 px-4 py-3">
                <p className="text-xs text-neutral-500">누적 응답 수</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {learningStats.overall.totalCount}
                  <span className="text-sm font-normal text-neutral-500"> 문항</span>
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-black/40 px-4 py-3">
                <p className="text-xs text-neutral-500">누적 정답</p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-sky-200">
                  {learningStats.overall.correctCount}
                  <span className="text-sm font-normal text-neutral-500">
                    {" "}
                    / {learningStats.overall.totalCount}
                  </span>
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-neutral-500">
              카테고리·추천 모드처럼 문제집이 아닌 풀이도 모두 포함됩니다. 같은 문항을
              여러 번 풀면 그만큼 응답 수가 증가합니다.
            </p>
          </section>
        ) : profile && extrasLoading ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 text-sm text-neutral-400">
            학습 통계를 불러오는 중입니다.
          </div>
        ) : null}

        {profile ? (
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5">
            <h2 className="text-lg font-semibold">문제집 채점·오답 노트</h2>
            <p className="mt-1 text-sm text-neutral-400">
              완료한 문제집별로 참여자 전체 평균 정답률·내 최초 제출 정답률·재제출을
              포함한 회차별 선택·정오답 내역을 볼 수 있습니다.
            </p>
            <p className="mt-2 text-[11px] text-neutral-500">
              참여 통계 평균은 일반 회원 최초 제출만 포함합니다.
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {solvedRows.length === 0 ? (
                <li className="rounded-xl border border-dashed border-neutral-700 px-3 py-6 text-center text-sm text-neutral-500">
                  아직 완료한 문제집이 없습니다. 홈에서 문제집을 풀고 제출하면 이곳에
                  표시됩니다.
                </li>
              ) : (
                solvedRows.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-xl border border-neutral-800 bg-black/35 px-3 py-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {row.certificationType ? (
                            <span className="rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-400">
                              {row.certificationType}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm font-semibold text-neutral-100">
                          {row.title}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-500">
                          <span>
                            전체 평균 정답률{" "}
                            {typeof row.crowd?.accuracy === "number"
                              ? `${row.crowd.accuracy.toFixed(1)}% (${row.crowd.attemptCount}명 참여)`
                              : "-"}
                          </span>
                          <span className="text-emerald-200/90">
                            내 최초 제출 정답률{" "}
                            {row.mine
                              ? `${row.mine.accuracy.toFixed(1)}% (${row.mine.correctCount}/${row.mine.totalCount})`
                              : "-"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => void openReviewForWorkbook(row.id)}
                        className="shrink-0 rounded-lg border border-amber-500/70 bg-amber-950/40 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:border-amber-400"
                      >
                        채점 결과 보기
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
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

        {reviewWorkbookId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-3 py-6">
            <button
              type="button"
              aria-label="배경을 눌러 닫기"
              className="absolute inset-0 cursor-default bg-transparent"
              onClick={() => closeReviewModal()}
            />
            <div
              role="dialog"
              aria-modal="true"
              className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-neutral-800 px-4 py-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-neutral-100">
                    채점 상세 · {reviewData?.title || reviewWorkbookId}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => closeReviewModal()}
                  className="shrink-0 rounded-lg border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:border-neutral-500"
                >
                  닫기
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {reviewLoading ? (
                  <p className="text-sm text-neutral-400">불러오는 중…</p>
                ) : (
                  <>
                    {reviewModalError ? (
                      <p className="mb-3 rounded-lg border border-amber-900/60 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
                        {reviewModalError}
                      </p>
                    ) : null}
                    {(reviewData?.sessions ?? []).map((sess, idx) => {
                      const n = idx + 1;
                      return (
                        <details
                          key={`${sess.submittedAt}-${idx}`}
                          className="mb-3 rounded-xl border border-neutral-800 bg-neutral-900/50"
                          open={idx === 0}
                        >
                          <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-900/80 [&::-webkit-details-marker]:hidden">
                            <span className="tabular-nums">
                              제출 #{n} ·{" "}
                              {new Date(sess.submittedAt).toLocaleString("ko-KR")}{" "}
                              · {sess.correctCount}/{sess.totalCount} 문항 정답 (
                              {sess.accuracy}% )
                            </span>
                          </summary>
                          <div className="border-t border-neutral-800 px-3 py-3">
                            <ul className="flex flex-col gap-3">
                              {sess.items
                                .slice()
                                .sort((a, b) => a.questionNumber - b.questionNumber)
                                .map((item) => (
                                  <li
                                    key={`${sess.submittedAt}-${item.questionId}`}
                                    className="rounded-lg border border-neutral-800/80 bg-black/40 p-3"
                                  >
                                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                      <span className="tabular-nums text-neutral-500">
                                        문항 #{item.questionNumber}
                                      </span>
                                      <span
                                        className={
                                          item.isCorrect
                                            ? "font-semibold text-emerald-400"
                                            : "font-semibold text-rose-400"
                                        }
                                      >
                                        {item.isCorrect ? "정답" : "오답"}
                                      </span>
                                      <span className="text-neutral-600">
                                        {item.questionCategory}
                                      </span>
                                      <span className="text-neutral-600">
                                        · 난이도 {item.difficulty}
                                      </span>
                                    </div>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-100">
                                      {item.questionDescription}
                                    </p>
                                    <dl className="mt-3 space-y-1.5 text-[11px]">
                                      <div>
                                        <dt className="text-neutral-500">
                                          선택한 보기
                                        </dt>
                                        <dd className="text-neutral-200">
                                          {formatChoiceLine(
                                            item.choices,
                                            item.selectedAnswer,
                                          )}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="text-neutral-500">
                                          정답
                                        </dt>
                                        <dd className="font-medium text-emerald-300">
                                          {formatChoiceLine(
                                            item.choices,
                                            item.correctAnswer,
                                          )}
                                        </dd>
                                      </div>
                                    </dl>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </details>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
