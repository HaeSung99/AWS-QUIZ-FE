"use client";

import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY;

type QuizQuestion = {
  id: string;
  questionNumber: number;
  questionDescription: string;
  choices: string[];
  answer: string;
  hint?: string;
  difficulty: string;
  questionCategory: string;
};
type QuizResultItem = {
  questionId: string;
  questionNumber: number;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
};

function subscribeAuthToken(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getAuthTokenSnapshot() {
  if (typeof window === "undefined" || !ACCESS_TOKEN_KEY) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export default function QuizPage() {
  const searchParams = useSearchParams();
  const workbookId = searchParams.get("workbookId") ?? "";
  const token = useSyncExternalStore(subscribeAuthToken, getAuthTokenSnapshot, () => null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [resultItems, setResultItems] = useState<QuizResultItem[]>([]);

  useEffect(() => {
    if (!API_BASE_URL || !workbookId || !token) return;
    void (async () => {
      setMessage("");
      try {
        const { data } = await axios.get<QuizQuestion[]>(
          `${API_BASE_URL}/public/workbooks/${workbookId}/items`,
        );
        setQuestions(Array.isArray(data) ? data : []);
      } catch (e) {
        if (axios.isAxiosError(e)) {
          const errMsg = Array.isArray(e.response?.data?.message)
            ? e.response?.data?.message.join(", ")
            : e.response?.data?.message ?? e.message;
          setMessage(errMsg || "문제 조회 실패");
          return;
        }
        setMessage("문제 조회 실패");
      }
    })();
  }, [token, workbookId]);

  const currentQuestion = useMemo(
    () => (questions.length > 0 ? questions[currentIndex] : null),
    [questions, currentIndex],
  );

  const onSubmit = async () => {
    if (!currentQuestion || !API_BASE_URL || !token || !ACCESS_TOKEN_KEY || !AUTH_USER_KEY) return;
    const total = questions.length;
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
    const score = items.reduce((acc, item) => acc + (item.isCorrect ? 1 : 0), 0);
    setResultItems(items);
    setResult({ score, total });
    setSubmitted(true);

    try {
      const { data } = await axios.post<{ solvedWorkbookIds: string[] }>(
        `${API_BASE_URL}/auth/me/solved-workbooks/${workbookId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
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
  };

  const onGoToQuestionFromResult = (questionId: string) => {
    const idx = questions.findIndex((q) => q.id === questionId);
    if (idx < 0) return;
    setCurrentIndex(idx);
    setSubmitted(false);
    setMessage("");
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-black text-neutral-100 flex flex-col items-center justify-center px-4">
        <p className="text-neutral-400">문제 풀기는 로그인 후 가능합니다.</p>
        <Link href="/login" className="mt-4 text-sm text-sky-400 underline-offset-2 hover:underline">
          로그인하러 가기 →
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-neutral-100">
      <div className="mx-auto w-full max-w-3xl">
        {!workbookId ? (
          <div className="rounded-lg border border-neutral-700 bg-neutral-900/60 px-4 py-6 text-center text-sm text-neutral-400">
            문제집 정보가 없습니다.
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-lg border border-neutral-700 bg-neutral-900/60 px-4 py-6 text-center text-sm text-neutral-400">
            {message || "문제를 불러오는 중이거나 등록된 문제가 없습니다."}
          </div>
        ) : submitted ? (
          <div className="rounded-lg border border-neutral-700 bg-neutral-900/60 p-6">
            <h1 className="text-lg font-semibold">채점 결과</h1>
            {result ? (
              <p className="mt-2 text-sm text-emerald-300">
                총점: {result.score} / {result.total}
              </p>
            ) : null}
            {message ? <p className="mt-2 text-sm text-amber-300">{message}</p> : null}

            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {resultItems.map((item) => (
                <button
                  key={item.questionId}
                  type="button"
                  title="클릭하면 해당 문제로 이동"
                  onClick={() => onGoToQuestionFromResult(item.questionId)}
                  className={`rounded-md border px-2 py-1 text-sm transition ${
                    item.isCorrect
                      ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-300"
                      : "border-rose-500/50 bg-rose-950/30 text-rose-300"
                  }`}
                >
                  {item.questionNumber}번
                </button>
              ))}
            </div>

            <ul className="mt-5 space-y-2">
              {resultItems.map((item) => (
                <li
                  key={`detail-${item.questionId}`}
                  className="rounded-md border border-neutral-700 bg-black/40 px-3 py-2 text-sm"
                >
                  <p className={item.isCorrect ? "text-emerald-300" : "text-rose-300"}>
                    {item.questionNumber}번 {item.isCorrect ? "정답" : "오답"}
                  </p>
                  <p className="mt-1 text-neutral-400">
                    내 답: {item.selectedAnswer ?? "미응답"} / 정답: {item.correctAnswer}
                  </p>
                  {!item.isCorrect ? (
                    <button
                      type="button"
                      onClick={() => onGoToQuestionFromResult(item.questionId)}
                      className="mt-2 cursor-pointer rounded-md border border-rose-500/60 bg-rose-950/30 px-2 py-1 text-xs text-rose-200 transition hover:border-rose-400 hover:bg-rose-950/50"
                    >
                      해당 문제로 바로가기
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-lg border border-neutral-700 bg-neutral-900/60 p-6">
            <p className="text-xs text-neutral-500">
              {currentIndex + 1} / {questions.length}
            </p>
            <h1 className="mt-1 text-lg font-semibold">
              {currentQuestion?.questionNumber}번. {currentQuestion?.questionDescription}
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              난이도 {currentQuestion?.difficulty} / {currentQuestion?.questionCategory}
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {currentQuestion?.choices.map((choice, idx) => (
                <button
                  key={`${choice}-${idx}`}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: choice }))
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

            {message ? <p className="mt-2 text-sm text-amber-300">{message}</p> : null}

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
                  onClick={onSubmit}
                  disabled={currentIndex !== questions.length - 1}
                  className="cursor-pointer rounded-md border border-fuchsia-500/80 bg-fuchsia-950/50 px-4 py-2 text-sm font-medium text-fuchsia-100 transition hover:-translate-y-0.5 hover:border-fuchsia-400 hover:bg-fuchsia-900/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  제출하기
                </button>
              </div>

              <div className="flex justify-end">
                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
                    className="cursor-pointer rounded-md border border-neutral-500 px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-800"
                  >
                    다음
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <Link href="/" className="mt-4 inline-block text-sm text-sky-400 underline-offset-2 hover:underline">
          ← 메인으로
        </Link>
      </div>
    </main>
  );
}
