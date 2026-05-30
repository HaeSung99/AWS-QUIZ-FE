"use client";

import { AUTH_STORAGE_CHANGED_EVENT, getAccessToken, getRefreshToken } from "@/lib/auth-client";
import {
  getApiErrorMessage,
  isApiConfigured,
  isUnauthorizedError,
  publicApi,
  userApi,
  type QuizQuestion,
  type ReviewItem,
} from "@/lib/api";
import { WorkbookReviewItems } from "@/components/workbook-review-items";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY;

type QuizResultItem = {
  questionId: string;
  questionNumber: number;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
};

type QuestionInfoReveal = {
  difficulty: boolean;
  category: boolean;
  hint: boolean;
};

const defaultReveal: QuestionInfoReveal = {
  difficulty: false,
  category: false,
  hint: false,
};

function scrollToReviewItem(questionId: string) {
  document
    .getElementById(`quiz-review-item-${questionId}`)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildReviewItemsFromResult(
  resultItems: QuizResultItem[],
  questionById: Map<string, QuizQuestion>,
): ReviewItem[] {
  return resultItems.map((item) => {
    const q = questionById.get(item.questionId);
    return {
      questionId: item.questionId,
      questionNumber: item.questionNumber,
      questionDescription: q?.questionDescription ?? "",
      choices: q?.choices ?? [],
      difficulty: q?.difficulty ?? "미지정",
      questionCategory: q?.questionCategory ?? "미분류",
      selectedAnswer: item.selectedAnswer,
      correctAnswer: item.correctAnswer,
      isCorrect: item.isCorrect,
    };
  });
}

function subscribeAuthToken(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AUTH_STORAGE_CHANGED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AUTH_STORAGE_CHANGED_EVENT, onStoreChange);
  };
}

function getAuthTokenSnapshot() {
  return getAccessToken() ?? getRefreshToken();
}

function QuizPageContent() {
  const searchParams = useSearchParams();
  const workbookId = searchParams.get("workbookId") ?? "";
  const category = searchParams.get("category")?.trim() ?? "";
  const isRecommendedMode = searchParams.get("recommended") === "weakness";
  const isDailyMode = searchParams.get("daily") === "true";
  const token = useSyncExternalStore(
    subscribeAuthToken,
    getAuthTokenSnapshot,
    () => null,
  );
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ score: number; total: number } | null>(
    null,
  );
  const [submitted, setSubmitted] = useState(false);
  const [resultItems, setResultItems] = useState<QuizResultItem[]>([]);
  const [infoRevealByQuestion, setInfoRevealByQuestion] = useState<
    Record<string, QuestionInfoReveal>
  >({});
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCategoryMode = !workbookId && Boolean(category);

  useEffect(() => {
    if (!isApiConfigured() || !token) return;
    if (!workbookId && !category && !isRecommendedMode && !isDailyMode) return;
    void (async () => {
      setMessage("");
      setQuestions([]);
      setAnswers({});
      setResult(null);
      setResultItems([]);
      setSubmitted(false);
      setCurrentIndex(0);
      try {
        const data = isDailyMode
          ? await userApi.getDailyQuestions(5)
          : isRecommendedMode
            ? await userApi.getRecommendedQuestions(20)
            : workbookId
              ? await publicApi.getWorkbookItems(workbookId)
              : await publicApi.getQuestionsByCategory(category, 20);
        setQuestions(Array.isArray(data) ? data : []);
      } catch (e) {
        setMessage(getApiErrorMessage(e, "문제 조회 실패"));
      }
    })();
  }, [workbookId, category, isRecommendedMode, isDailyMode]);

  const currentQuestion = useMemo(
    () => (questions.length > 0 ? questions[currentIndex] : null),
    [questions, currentIndex],
  );

  const questionById = useMemo(() => {
    const m = new Map<string, QuizQuestion>();
    for (const q of questions) {
      m.set(q.id, q);
    }
    return m;
  }, [questions]);

  const currentInfoReveal = currentQuestion
    ? (infoRevealByQuestion[currentQuestion.id] ?? defaultReveal)
    : defaultReveal;

  const toggleInfoReveal = (field: keyof QuestionInfoReveal) => {
    if (!currentQuestion) return;
    setInfoRevealByQuestion((prev) => {
      const prevRow = prev[currentQuestion.id] ?? defaultReveal;
      return {
        ...prev,
        [currentQuestion.id]: { ...prevRow, [field]: !prevRow[field] },
      };
    });
  };

  const reviewItems = useMemo(
    () => buildReviewItemsFromResult(resultItems, questionById),
    [resultItems, questionById],
  );

  const resultAccuracy = useMemo(() => {
    if (!result || result.total === 0) return 0;
    return Number(((result.score / result.total) * 100).toFixed(1));
  }, [result]);

  const unansweredCount = useMemo(
    () => questions.reduce((n, q) => (answers[q.id] ? n : n + 1), 0),
    [questions, answers],
  );

  useEffect(() => {
    if (!submitConfirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) setSubmitConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submitConfirmOpen, isSubmitting]);

  const onSubmit = async () => {
    if (!isApiConfigured() || !AUTH_USER_KEY) return;
    if (!getAccessToken() && !getRefreshToken()) return;
    const total = questions.length;
    if (total === 0) return;

    setIsSubmitting(true);
    try {
      const items = questions.map((q) => {
        const selected = answers[q.id] ?? null;
        const isCorrect = selected === q.answer;
        return {
          questionId: q.id,
          questionNumber: q.questionNumber,
          selectedAnswer: selected,
          correctAnswer: q.answer,
          isCorrect,
        };
      });
      const score = items.reduce(
        (acc, item) => acc + (item.isCorrect ? 1 : 0),
        0,
      );
      setResultItems(items);
      setResult({ score, total });
      setSubmitted(true);

      try {
        await userApi.recordWorkbookAttempt({
          workbookId: workbookId || undefined,
          correctCount: score,
          totalCount: total,
          questionAttempts: items.map((item) => {
            const q = questionById.get(item.questionId);
            return {
              questionId: item.questionId,
              questionCategory: q?.questionCategory ?? "미분류",
              difficulty: q?.difficulty ?? "미지정",
              certificationType: q?.certificationType ?? null,
              selectedAnswer: item.selectedAnswer,
              correctAnswer: item.correctAnswer,
              isCorrect: item.isCorrect,
            };
          }),
        });
      } catch (submitErr) {
        if (isUnauthorizedError(submitErr)) {
          setMessage(
            "세션이 만료되어 서버에 저장하지 못했습니다. 다시 로그인 후 제출해주세요.",
          );
        }
      }

      if (!workbookId) {
        setMessage("채점 완료 및 약점 유형 통계 저장");
        return;
      }

      try {
        const data = await userApi.markWorkbookSolved(workbookId);
        const rawUser = localStorage.getItem(AUTH_USER_KEY);
        if (rawUser) {
          const user = JSON.parse(rawUser) as {
            id: number;
            email: string;
            name: string;
            role: "user" | "admin";
            solvedWorkbookIds?: string[];
          };
          user.solvedWorkbookIds = data.solvedWorkbookIds;
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        }
        setMessage("채점 완료 및 풀이 완료 저장");
      } catch {
        setMessage("채점은 완료됐지만 풀이 완료 저장은 실패");
      }
    } finally {
      setIsSubmitting(false);
      setSubmitConfirmOpen(false);
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-black text-neutral-100 flex flex-col items-center justify-center px-4">
        <p className="text-neutral-400">문제 풀기는 로그인 후 가능합니다.</p>
        <Link
          href="/login"
          className="mt-4 text-sm text-sky-400 underline-offset-2 hover:underline"
        >
          로그인하러 가기 →
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-neutral-100">
      <div className="mx-auto w-full max-w-3xl">
        {!workbookId && !category && !isRecommendedMode && !isDailyMode ? (
          <div className="rounded-lg border border-neutral-700 bg-neutral-900/60 px-4 py-6 text-center text-sm text-neutral-400">
            풀이 정보가 없습니다.
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-lg border border-neutral-700 bg-neutral-900/60 px-4 py-6 text-center text-sm text-neutral-400">
            {message || "문제를 불러오는 중이거나 등록된 문제가 없습니다."}
          </div>
        ) : submitted ? (
          <div className="rounded-lg border border-neutral-700 bg-neutral-900/60 p-6">
            <h1 className="text-xl font-semibold tracking-tight text-neutral-50">
              채점 결과
            </h1>
            {result ? (
              <div className="mt-3 inline-flex min-w-[12rem] items-baseline gap-2 rounded-lg border-2 border-emerald-500/40 bg-emerald-950/40 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wide text-emerald-200/85">
                  총점
                </span>
                <span className="text-2xl font-bold tabular-nums text-emerald-100">
                  {result.score}
                  <span className="text-base font-semibold text-emerald-300/80">
                    {" "}
                    / {result.total}
                  </span>
                </span>
              </div>
            ) : null}
            {message ? (
              <p className="mt-2 text-sm text-amber-300">{message}</p>
            ) : null}

            <div className="mt-4 grid grid-cols-4 gap-2.5 sm:grid-cols-6">
              {resultItems.map((item) => (
                <button
                  key={item.questionId}
                  type="button"
                  title="클릭하면 아래 채점 상세로 이동"
                  onClick={() => scrollToReviewItem(item.questionId)}
                  className={`rounded-lg border-2 px-2 py-2 text-sm font-medium shadow-sm transition hover:brightness-110 ${
                    item.isCorrect
                      ? "border-emerald-400/70 bg-emerald-950/50 text-emerald-100"
                      : "border-rose-400/70 bg-rose-950/50 text-rose-100"
                  }`}
                >
                  {item.questionNumber}번
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
              <div className="border-b border-neutral-800 px-4 py-3">
                <h2 className="text-sm font-semibold text-neutral-200">
                  채점 상세
                </h2>
                {result ? (
                  <p className="mt-1 text-xs text-neutral-400">
                    이번 제출 · {result.score}/{result.total} 문항 정답 (
                    {resultAccuracy}%)
                  </p>
                ) : null}
              </div>
              <div className="px-4 py-4">
                <WorkbookReviewItems
                  items={reviewItems}
                  itemIdPrefix="quiz-review-item"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-neutral-700 bg-neutral-900/60 p-6">
            <p className="text-xs text-neutral-500">
              {isDailyMode ? "오늘의 문제 · " : ""}
              {isRecommendedMode ? "AI 추천 약점 문제 · " : ""}
              {isCategoryMode ? `유형: ${category} · ` : ""}
              {currentIndex + 1} / {questions.length}
            </p>
            <h1 className="mt-1 text-lg font-semibold">
              {currentQuestion?.questionNumber}번.
            </h1>
            <p className="mt-2 text-base font-normal leading-relaxed text-neutral-200">
              {currentQuestion?.questionDescription}
            </p>

            {currentQuestion ? (
              <div className="mt-2 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => toggleInfoReveal("difficulty")}
                  className="cursor-pointer rounded-md border border-neutral-600 bg-neutral-950/80 px-2.5 py-1 text-[11px] text-neutral-200 transition hover:border-neutral-400 hover:bg-neutral-800"
                >
                  {currentInfoReveal.difficulty
                    ? "난이도 숨기기"
                    : "난이도 보기"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleInfoReveal("category")}
                  className="cursor-pointer rounded-md border border-neutral-600 bg-neutral-950/80 px-2.5 py-1 text-[11px] text-neutral-200 transition hover:border-neutral-400 hover:bg-neutral-800"
                >
                  {currentInfoReveal.category ? "유형 숨기기" : "유형 보기"}
                </button>
              </div>
            ) : null}

            {currentQuestion && currentInfoReveal.difficulty ? (
              <p className="mt-2 text-right text-xs text-neutral-400">
                난이도: {currentQuestion.difficulty}
              </p>
            ) : null}
            {currentQuestion && currentInfoReveal.category ? (
              <p className="mt-1 text-right text-xs text-neutral-400">
                유형: {currentQuestion.questionCategory}
              </p>
            ) : null}
            {!isDailyMode && currentQuestion?.recommendReason ? (
              <p className="mt-2 rounded-md border border-fuchsia-500/40 bg-fuchsia-950/25 px-3 py-2 text-xs leading-relaxed text-fuchsia-100">
                추천 이유: {currentQuestion.recommendReason}
                {typeof currentQuestion.similarity === "number"
                  ? ` · 유사도 ${(currentQuestion.similarity * 100).toFixed(1)}%`
                  : ""}
              </p>
            ) : null}

            <div className="mt-4 flex flex-col gap-2">
              {currentQuestion?.choices.map((choice, idx) => (
                <button
                  key={`${choice}-${idx}`}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [currentQuestion.id]: choice,
                    }))
                  }
                  className={`cursor-pointer rounded-md border px-3 py-2 text-left text-sm transition hover:-translate-y-0.5 ${
                    answers[currentQuestion.id] === choice
                      ? "border-sky-500 bg-sky-950/40 hover:bg-sky-900/40"
                      : "border-neutral-700 bg-black hover:border-neutral-300 hover:bg-neutral-800"
                  }`}
                >
                  {idx + 1}번. {choice}
                </button>
              ))}
            </div>

            {currentQuestion ? (
              <div className="mt-3 flex justify-start">
                <button
                  type="button"
                  onClick={() => toggleInfoReveal("hint")}
                  className="cursor-pointer rounded-md border border-neutral-600 bg-neutral-950/80 px-2.5 py-1 text-[11px] text-neutral-200 transition hover:border-neutral-400 hover:bg-neutral-800"
                >
                  {currentInfoReveal.hint ? "힌트 숨기기" : "힌트 보기"}
                </button>
              </div>
            ) : null}

            {currentQuestion && currentInfoReveal.hint ? (
              <p className="mt-2 text-left text-xs leading-relaxed text-amber-200/90">
                힌트:{" "}
                {currentQuestion.hint?.trim()
                  ? currentQuestion.hint
                  : "이 문제에는 등록된 힌트가 없습니다."}
              </p>
            ) : null}

            {message ? (
              <p className="mt-2 text-sm text-amber-300">{message}</p>
            ) : null}

            {submitConfirmOpen ? (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                role="presentation"
                onClick={(e) => {
                  if (e.target === e.currentTarget && !isSubmitting)
                    setSubmitConfirmOpen(false);
                }}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="submit-confirm-title"
                  className="w-full max-w-md rounded-xl border border-neutral-600 bg-neutral-950 p-5 shadow-2xl ring-1 ring-white/10"
                >
                  <h2
                    id="submit-confirm-title"
                    className="text-lg font-semibold text-neutral-50"
                  >
                    제출 확인
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                    이대로 제출하시겠습니까? 제출 후에는 아래 채점 상세에서
                    문항별 정오답과 해설을 확인할 수 있습니다.
                  </p>
                  <p className="mt-3 rounded-lg border border-sky-500/40 bg-sky-950/30 px-3 py-2 text-sm font-medium text-sky-100">
                    최초 제출만 정답률로 집계됩니다.
                  </p>
                  {unansweredCount > 0 ? (
                    <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-950/35 px-3 py-2 text-sm text-amber-100">
                      아직 답하지 않은 문제가 {unansweredCount}개 있습니다.
                      미응답은 오답으로 채점됩니다.
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                    문제집 통계(평균 정답률)에는{" "}
                    <span className="text-neutral-400">
                      회원별 이 문제집의 최초 제출 점수만
                    </span>{" "}
                    집계됩니다. 같은 문제집을 다시 제출해도 정답률 통계는 바뀌지
                    않습니다.
                  </p>
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setSubmitConfirmOpen(false)}
                      className="cursor-pointer rounded-lg border border-neutral-600 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => void onSubmit()}
                      className="cursor-pointer rounded-lg border-2 border-fuchsia-500/80 bg-fuchsia-950/60 px-4 py-2 text-sm font-semibold text-fuchsia-50 transition hover:border-fuchsia-400 hover:bg-fuchsia-900/70 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? "제출 중…" : "제출하기"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-3 items-center gap-2">
              <div className="flex justify-start">
                {currentIndex > 0 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                    className="cursor-pointer rounded-md border border-neutral-500 px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-800"
                  >
                    이전
                  </button>
                ) : null}
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setSubmitConfirmOpen(true)}
                  disabled={isSubmitting}
                  className="cursor-pointer rounded-md border border-fuchsia-500/80 bg-fuchsia-950/50 px-4 py-2 text-sm font-medium text-fuchsia-100 transition hover:-translate-y-0.5 hover:border-fuchsia-400 hover:bg-fuchsia-900/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  제출하기
                </button>
              </div>

              <div className="flex justify-end">
                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((p) =>
                        Math.min(questions.length - 1, p + 1),
                      )
                    }
                    className="cursor-pointer rounded-md border border-neutral-500 px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-800"
                  >
                    다음
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <Link
          href="/"
          className="mt-4 inline-block text-sm text-sky-400 underline-offset-2 hover:underline"
        >
          ← 메인으로
        </Link>
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-neutral-100 flex flex-col items-center justify-center px-4">
          <p className="text-neutral-400">퀴즈 화면 준비 중...</p>
        </main>
      }
    >
      <QuizPageContent />
    </Suspense>
  );
}
