"use client";

import axios from "axios";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

type AuthUser = { id: number; email: string; name: string; role: "user" | "admin" };
type Workbook = {
  id: string;
  certificationType: string;
  title: string;
  summary: string;
  questionCount: number;
};
type WorkbookAccuracy = {
  workbookId: string;
  title: string;
  accuracy: number;
  attemptCount: number;
};
type QuestionItem = {
  id: string;
  questionId: string;
  questionNumber: number;
  questionDescription: string;
  choices: string[];
  answer: string;
  hint?: string;
  difficulty: string;
  questionCategory: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY;
const subscribeNoop = () => () => {};

export default function AdminWorkbookPage() {
  const isHydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [accuracyRows, setAccuracyRows] = useState<WorkbookAccuracy[]>([]);
  const [items, setItems] = useState<QuestionItem[]>([]);
  const [selectedWorkbookId, setSelectedWorkbookId] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error" | "info">("info");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [certificationType, setCertificationType] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [questionCount, setQuestionCount] = useState(20);
  const [editingWorkbookId, setEditingWorkbookId] = useState("");

  const [questionNumber, setQuestionNumber] = useState(1);
  const [questionDescription, setQuestionDescription] = useState("");
  const [choiceCount, setChoiceCount] = useState(4);
  const [choiceValues, setChoiceValues] = useState<string[]>(["", "", "", ""]);
  const [answerNumber, setAnswerNumber] = useState("");
  const [hint, setHint] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionCategory, setQuestionCategory] = useState("");
  const [editingItemId, setEditingItemId] = useState("");

  const [saving, setSaving] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

  const auth = (() => {
    if (!isHydrated || !API_BASE_URL || !ACCESS_TOKEN_KEY || !AUTH_USER_KEY) {
      return { token: null as string | null, user: null as AuthUser | null };
    }
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!token || !raw) return { token: null, user: null };
    try {
      return { token, user: JSON.parse(raw) as AuthUser };
    } catch {
      return { token: null, user: null };
    }
  })();
  const authRole = auth.user?.role ?? null;

  const resizeChoiceValues = (nextCount: number) => {
    setChoiceValues((prev) => {
      const next = [...prev];
      if (next.length < nextCount) {
        return [...next, ...Array.from({ length: nextCount - next.length }, () => "")];
      }
      return next.slice(0, nextCount);
    });
  };

  const resetWorkbookForm = () => {
    setCertificationType("");
    setTitle("");
    setSummary("");
    setQuestionCount(20);
    setEditingWorkbookId("");
  };

  const resetItemForm = () => {
    setQuestionNumber(1);
    setQuestionDescription("");
    setChoiceCount(4);
    setChoiceValues(["", "", "", ""]);
    setAnswerNumber("");
    setHint("");
    setDifficulty("");
    setQuestionCategory("");
    setEditingItemId("");
  };

  const loadItems = async (workbookId: string) => {
    if (!API_BASE_URL || !auth.token || authRole !== "admin") return;
    try {
      const { data } = await axios.get<QuestionItem[]>(
        `${API_BASE_URL}/admin/questions/${workbookId}/items`,
        { headers: { Authorization: `Bearer ${auth.token}` } },
      );
      const list = (Array.isArray(data) ? data : []).sort(
        (a, b) => a.questionNumber - b.questionNumber,
      );
      setItems(list);
      if (!editingItemId) {
        const lastNumber = list.length > 0 ? Math.max(...list.map((item) => item.questionNumber)) : 0;
        setQuestionNumber(lastNumber + 1);
      }
    } catch {
      setItems([]);
      if (!editingItemId) {
        setQuestionNumber(1);
      }
    }
  };

  const loadData = async () => {
    if (!API_BASE_URL || !auth.token || authRole !== "admin") return;
    try {
      const [workbookRes, accuracyRes] = await Promise.all([
        axios.get<Workbook[]>(`${API_BASE_URL}/admin/questions`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
        axios.get<WorkbookAccuracy[]>(`${API_BASE_URL}/public/workbooks/accuracy`),
      ]);
      setWorkbooks(Array.isArray(workbookRes.data) ? workbookRes.data : []);
      setAccuracyRows(Array.isArray(accuracyRes.data) ? accuracyRes.data : []);
    } catch (err) {
      const text = axios.isAxiosError(err)
        ? (Array.isArray(err.response?.data?.message)
            ? err.response?.data?.message.join(", ")
            : err.response?.data?.message) ?? err.message
        : "문제집 정보를 불러오지 못했습니다.";
      setMessage(text || "문제집 정보를 불러오지 못했습니다.");
      setMessageTone("error");
      setWorkbooks([]);
      setAccuracyRows([]);
    }
  };

  useEffect(() => {
    if (!API_BASE_URL || !auth.token || authRole !== "admin") return;
    setMessage("");
    void (async () => {
      await loadData();
    })();
  }, [auth.token, authRole]);

  const onCreateWorkbook = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!API_BASE_URL || !auth.token || authRole !== "admin") return;
    setMessage("");
    setMessageTone("info");
    setSaving(true);
    try {
      if (editingWorkbookId) {
        await axios.patch(
          `${API_BASE_URL}/admin/questions/${editingWorkbookId}`,
          { certificationType, title, summary, questionCount },
          { headers: { Authorization: `Bearer ${auth.token}` } },
        );
        setMessage("문제집 수정 완료");
        setMessageTone("success");
      } else {
        await axios.post(
          `${API_BASE_URL}/admin/questions`,
          { certificationType, title, summary, questionCount },
          { headers: { Authorization: `Bearer ${auth.token}` } },
        );
        setMessage("문제집 생성 완료");
        setMessageTone("success");
      }
      resetWorkbookForm();
      await loadData();
    } catch (err) {
      const text = axios.isAxiosError(err)
        ? (Array.isArray(err.response?.data?.message)
            ? err.response?.data?.message.join(", ")
            : err.response?.data?.message) ?? err.message
        : "문제집 생성 실패";
      setMessage(text || "문제집 생성 실패");
      setMessageTone("error");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteWorkbook = async (workbookId: string) => {
    if (!API_BASE_URL || !auth.token || authRole !== "admin") return;
    setMessage("");
    setMessageTone("info");
    try {
      await axios.delete(`${API_BASE_URL}/admin/questions/${workbookId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (selectedWorkbookId === workbookId) {
        setSelectedWorkbookId("");
        setItems([]);
      }
      if (editingWorkbookId === workbookId) {
        resetWorkbookForm();
      }
      setMessage("문제집 삭제 완료");
      setMessageTone("success");
      await loadData();
    } catch (err) {
      const text = axios.isAxiosError(err)
        ? (Array.isArray(err.response?.data?.message)
            ? err.response?.data?.message.join(", ")
            : err.response?.data?.message) ?? err.message
        : "문제집 삭제 실패";
      setMessage(text || "문제집 삭제 실패");
      setMessageTone("error");
    }
  };

  const onSaveItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!API_BASE_URL || !auth.token || authRole !== "admin" || !selectedWorkbookId) return;
    const choices = choiceValues
      .slice(0, choiceCount)
      .map((choice) => choice.trim());

    if (choices.some((choice) => !choice)) {
      setMessage("보기 내용을 모두 입력해주세요.");
      setMessageTone("error");
      return;
    }
    const answerIndex = Number(answerNumber) - 1;
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= choices.length) {
      setMessage("정답 번호를 선택해주세요.");
      setMessageTone("error");
      return;
    }
    if (!difficulty) {
      setMessage("난이도를 선택해주세요.");
      setMessageTone("error");
      return;
    }
    const trimmedQuestionCategory = questionCategory.trim();
    if (!trimmedQuestionCategory) {
      setMessage("문제 종류를 입력해주세요.");
      setMessageTone("error");
      return;
    }

    setMessage("");
    setMessageTone("info");
    setSavingItem(true);
    try {
      const payload = {
        questionNumber,
        questionDescription,
        choices,
        answer: choices[answerIndex],
        hint,
        difficulty,
        questionCategory: trimmedQuestionCategory,
      };
      if (editingItemId) {
        await axios.patch(
          `${API_BASE_URL}/admin/questions/${selectedWorkbookId}/items/${editingItemId}`,
          payload,
          { headers: { Authorization: `Bearer ${auth.token}` } },
        );
        setMessage("문제 수정 완료");
        setMessageTone("success");
      } else {
        await axios.post(
          `${API_BASE_URL}/admin/questions/${selectedWorkbookId}/items`,
          payload,
          { headers: { Authorization: `Bearer ${auth.token}` } },
        );
        setMessage("문제 생성 완료");
        setMessageTone("success");
      }
      resetItemForm();
      await loadItems(selectedWorkbookId);
      await loadData();
    } catch (err) {
      const text = axios.isAxiosError(err)
        ? (Array.isArray(err.response?.data?.message)
            ? err.response?.data?.message.join(", ")
            : err.response?.data?.message) ?? err.message
        : "문제 저장 실패";
      setMessage(text || "문제 저장 실패");
      setMessageTone("error");
    } finally {
      setSavingItem(false);
    }
  };

  const onDeleteItem = async (itemId: string) => {
    if (!API_BASE_URL || !auth.token || authRole !== "admin" || !selectedWorkbookId) return;
    setMessage("");
    setMessageTone("info");
    try {
      const target = items.find((item) => item.id === itemId);
      const deletedNumber = target?.questionNumber ?? 0;
      await axios.delete(`${API_BASE_URL}/admin/questions/${selectedWorkbookId}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (editingItemId === itemId) {
        resetItemForm();
      }
      setItems((prev) =>
        prev
          .filter((item) => item.id !== itemId)
          .map((item) =>
            deletedNumber > 0 && item.questionNumber > deletedNumber
              ? { ...item, questionNumber: item.questionNumber - 1 }
              : item,
          )
          .sort((a, b) => a.questionNumber - b.questionNumber),
      );
      setMessage("문제 삭제 완료");
      setMessageTone("success");
      await loadItems(selectedWorkbookId);
    } catch (err) {
      const text = axios.isAxiosError(err)
        ? (Array.isArray(err.response?.data?.message)
            ? err.response?.data?.message.join(", ")
            : err.response?.data?.message) ?? err.message
        : "문제 삭제 실패";
      setMessage(text || "문제 삭제 실패");
      setMessageTone("error");
    }
  };

  const accuracyMap = useMemo(() => {
    const map = new Map<string, WorkbookAccuracy>();
    for (const row of accuracyRows) {
      map.set(row.workbookId, row);
    }
    return map;
  }, [accuracyRows]);

  const filteredWorkbooks = useMemo(() => {
    const q = searchKeyword.trim().toLowerCase();
    if (!q) return workbooks;
    return workbooks.filter((wb) => {
      return (
        wb.title.toLowerCase().includes(q) ||
        wb.certificationType.toLowerCase().includes(q) ||
        wb.summary.toLowerCase().includes(q)
      );
    });
  }, [workbooks, searchKeyword]);

  const selectedWorkbook = useMemo(
    () => workbooks.find((wb) => wb.id === selectedWorkbookId) ?? null,
    [workbooks, selectedWorkbookId],
  );
  const workbookFormMode = editingWorkbookId ? "문제집 정보 수정 모드" : "새 문제집 생성 모드";
  const itemFormMode = !selectedWorkbookId
    ? "문제집 선택 필요"
    : editingItemId
      ? "문제 수정 모드"
      : "새 문제 생성 모드";

  const totalAttempts = useMemo(
    () => accuracyRows.reduce((acc, row) => acc + row.attemptCount, 0),
    [accuracyRows],
  );
  const avgAccuracy = useMemo(() => {
    if (accuracyRows.length === 0) return 0;
    const sum = accuracyRows.reduce((acc, row) => acc + row.accuracy, 0);
    return Number((sum / accuracyRows.length).toFixed(1));
  }, [accuracyRows]);

  if (!isHydrated) {
    return <main className="flex flex-1 items-center justify-center text-neutral-300">확인 중...</main>;
  }

  if (!API_BASE_URL || !ACCESS_TOKEN_KEY || !AUTH_USER_KEY) {
    return (
      <main className="flex flex-1 items-center justify-center text-neutral-300">
        환경변수 설정을 확인해주세요.
      </main>
    );
  }

  if (!auth.token || !auth.user || authRole !== "admin") {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-950/70 p-6 text-center">
          <h1 className="text-lg font-semibold text-neutral-100">Admin 접근 제한</h1>
          <p className="mt-2 text-sm text-neutral-400">관리자 계정으로 로그인해야 합니다.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link href="/login" className="rounded-md border border-neutral-500 px-3 py-1.5 text-sm">
              로그인
            </Link>
            <Link href="/" className="text-sm text-sky-400 hover:underline">
              메인으로
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 bg-black text-neutral-100">
      <aside className="w-60 shrink-0 border-r border-neutral-800 bg-neutral-950 p-4">
        <h1 className="text-base font-semibold">Admin Dashboard</h1>
        <div className="mt-5 flex flex-col gap-2">
          <Link href="/admin" className="rounded-md border border-neutral-700 px-3 py-2 text-sm">
            통계
          </Link>
          <Link href="/admin/notice" className="rounded-md border border-neutral-700 px-3 py-2 text-sm">
            공지
          </Link>
          <Link
            href="/admin/workbook"
            className="rounded-md border border-sky-500 bg-sky-950/30 px-3 py-2 text-sm text-sky-200"
          >
            문제집
          </Link>
        </div>
      </aside>

      <section className="flex-1 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
            <p className="text-xs text-neutral-500">문제집 수</p>
            <p className="mt-1 text-2xl font-semibold">{workbooks.length}</p>
          </article>
          <article className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
            <p className="text-xs text-neutral-500">총 풀이 시도</p>
            <p className="mt-1 text-2xl font-semibold">{totalAttempts}</p>
          </article>
          <article className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
            <p className="text-xs text-neutral-500">문제집 평균 정답률</p>
            <p className="mt-1 text-2xl font-semibold">{avgAccuracy}%</p>
          </article>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_1.9fr]">
          <section className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">문제집 목록</h2>
              <input
                type="search"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="검색"
                className="w-28 rounded-md border border-neutral-700 bg-black px-2 py-1 text-xs"
              />
            </div>
            <div className="mt-3 max-h-[560px] space-y-2 overflow-y-auto pr-1">
              {filteredWorkbooks.map((workbook) => {
                const accuracy = accuracyMap.get(workbook.id);
                const selected = selectedWorkbookId === workbook.id;
                return (
                  <article
                    key={workbook.id}
                    className={`rounded-md border p-3 ${
                      selected ? "border-sky-500 bg-sky-950/20" : "border-neutral-700 bg-black/40"
                    }`}
                  >
                    <p className="text-[11px] text-neutral-500">{workbook.certificationType}</p>
                    <p className="mt-1 text-sm font-medium leading-snug">{workbook.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-400">{workbook.summary}</p>
                    <p className="mt-2 text-[11px] text-sky-300/90">
                      정답률 {accuracy ? `${accuracy.accuracy.toFixed(1)}%` : "-"}
                      {accuracy ? ` (참여 ${accuracy.attemptCount}명)` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWorkbookId(workbook.id);
                          resetItemForm();
                          void loadItems(workbook.id);
                        }}
                        className="cursor-pointer rounded border border-neutral-500 px-2 py-1 text-[11px]"
                      >
                        문제집 선택
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingWorkbookId(workbook.id);
                          setCertificationType(workbook.certificationType);
                          setTitle(workbook.title);
                          setSummary(workbook.summary);
                          setQuestionCount(workbook.questionCount);
                        }}
                        className="cursor-pointer rounded border border-neutral-500 px-2 py-1 text-[11px]"
                      >
                        문제집 정보 수정
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDeleteWorkbook(workbook.id)}
                        className="cursor-pointer rounded border border-rose-500/70 bg-rose-950/30 px-2 py-1 text-[11px] text-rose-200"
                      >
                        삭제
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
              <h3 className="text-base font-semibold">
                {editingWorkbookId ? "문제집 수정" : "문제집 생성"}
              </h3>
              <p className="mt-1 text-xs text-sky-300">{workbookFormMode}</p>
              <form onSubmit={onCreateWorkbook} className="mt-3 grid gap-2 md:grid-cols-2">
                <input
                  type="text"
                  value={certificationType}
                  onChange={(e) => setCertificationType(e.target.value)}
                  placeholder="자격증 종류 (예: SAA-C03)"
                  className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm"
                  required
                />
                <input
                  type="number"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  min={1}
                  placeholder="문항 수"
                  className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm"
                  required
                />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="문제집 제목"
                  className="md:col-span-2 rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm"
                  required
                />
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="간단 설명"
                  className="md:col-span-2 min-h-20 rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer rounded-md border border-amber-500/70 bg-amber-950/30 px-3 py-2 text-sm text-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "저장 중..." : editingWorkbookId ? "문제집 수정 저장" : "문제집 생성"}
                </button>
                {editingWorkbookId ? (
                  <button
                    type="button"
                    onClick={resetWorkbookForm}
                    className="cursor-pointer rounded-md border border-neutral-600 px-3 py-2 text-sm text-neutral-200"
                  >
                    수정 취소
                  </button>
                ) : null}
              </form>
            </section>

            <section className="rounded-lg border border-neutral-700 bg-neutral-950/70 p-4">
              <h3 className="text-base font-semibold">
                문제 관리 {selectedWorkbook ? `- ${selectedWorkbook.title}` : ""}
              </h3>
              <p className="mt-1 text-xs text-amber-300">{itemFormMode}</p>
              {selectedWorkbook ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-neutral-700 bg-black/40 px-3 py-2 text-xs text-neutral-300">
                  <span>선택 문제집: {selectedWorkbook.title}</span>
                  <span className="text-neutral-500">/ 목표 문항 수 {selectedWorkbook.questionCount}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWorkbookId("");
                      setItems([]);
                      resetItemForm();
                    }}
                    className="cursor-pointer rounded border border-neutral-600 px-2 py-1 text-[11px]"
                  >
                    선택 해제
                  </button>
                </div>
              ) : null}
              {selectedWorkbookId ? (
                <>
                  <form onSubmit={onSaveItem} className="mt-3 grid gap-2 md:grid-cols-2">
                    <input
                      type="number"
                      min={1}
                      value={questionNumber}
                      readOnly
                      placeholder="문제 번호(자동)"
                      className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-300"
                      required
                    />
                    <input
                      type="text"
                      value={questionCategory}
                      onChange={(e) => setQuestionCategory(e.target.value)}
                      placeholder="문제 종류"
                      className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm"
                      required
                    />
                    <textarea
                      value={questionDescription}
                      onChange={(e) => setQuestionDescription(e.target.value)}
                      placeholder="문제 설명"
                      className="md:col-span-2 min-h-20 rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm"
                      required
                    />
                    <div className="grid gap-2">
                      <label className="text-xs text-neutral-400">보기 개수</label>
                      <select
                        value={choiceCount}
                        onChange={(e) => {
                          const nextCount = Number(e.target.value);
                          setChoiceCount(nextCount);
                          resizeChoiceValues(nextCount);
                          setAnswerNumber("");
                        }}
                        className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm"
                      >
                        {[2, 3, 4, 5, 6, 7, 8].map((count) => (
                          <option key={`choice-count-${count}`} value={count}>
                            {count}개
                          </option>
                        ))}
                      </select>
                      <div className="space-y-2">
                        {Array.from({ length: choiceCount }, (_, idx) => (
                          <input
                            key={`choice-input-${idx + 1}`}
                            type="text"
                            value={choiceValues[idx] ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setChoiceValues((prev) => {
                                const next = [...prev];
                                next[idx] = value;
                                return next;
                              });
                            }}
                            placeholder={`${idx + 1}번 보기`}
                            className="w-full rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm"
                            required
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <select
                        value={answerNumber}
                        onChange={(e) => setAnswerNumber(e.target.value)}
                        className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm"
                        required
                      >
                        <option value="">정답 번호 선택</option>
                        {Array.from({ length: choiceCount }, (_, idx) => (
                          <option key={`answer-number-${idx + 1}`} value={idx + 1}>
                            {idx + 1}번 - {(choiceValues[idx] ?? "").trim() || "(보기 내용 입력 필요)"}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-neutral-500">
                        정답 선택은 "번호 - 보기 내용"을 확인하고 선택하세요.
                      </p>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm"
                        required
                      >
                        <option value="">난이도 선택</option>
                        <option value="상">상</option>
                        <option value="중">중</option>
                        <option value="하">하</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={hint}
                      onChange={(e) => setHint(e.target.value)}
                      placeholder="힌트 (선택)"
                      className="md:col-span-2 rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={savingItem}
                      className="cursor-pointer rounded-md border border-amber-500/70 bg-amber-950/30 px-3 py-2 text-sm text-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingItem ? "저장 중..." : editingItemId ? "문제 수정 저장" : "문제 생성"}
                    </button>
                    {editingItemId ? (
                      <button
                        type="button"
                        onClick={resetItemForm}
                        className="cursor-pointer rounded-md border border-neutral-600 px-3 py-2 text-sm text-neutral-200"
                      >
                        수정 취소
                      </button>
                    ) : null}
                  </form>

                  <div className="mt-4 max-h-[340px] space-y-2 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-md border border-neutral-700 bg-black/40 px-3 py-3"
                      >
                        <p className="text-sm font-medium">
                          {item.questionNumber}번. {item.questionDescription}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          난이도: {item.difficulty} / 종류: {item.questionCategory} / 정답: {item.answer}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItemId(item.id);
                              setQuestionNumber(item.questionNumber);
                              setQuestionDescription(item.questionDescription);
                              const nextChoiceCount = Math.max(2, item.choices.length);
                              setChoiceCount(nextChoiceCount);
                              setChoiceValues(item.choices);
                              const foundIdx = item.choices.findIndex((choice) => choice === item.answer);
                              setAnswerNumber(foundIdx >= 0 ? String(foundIdx + 1) : "");
                              setHint(item.hint ?? "");
                              setDifficulty(item.difficulty);
                              setQuestionCategory(item.questionCategory);
                            }}
                            className="cursor-pointer rounded border border-neutral-500 px-2 py-1 text-[11px]"
                          >
                            이 문제 수정
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDeleteItem(item.id)}
                            className="cursor-pointer rounded border border-rose-500/70 bg-rose-950/30 px-2 py-1 text-[11px] text-rose-200"
                          >
                            삭제
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-neutral-400">
                  왼쪽 목록에서 문제집을 선택하면 문제 CRUD를 사용할 수 있습니다.
                </p>
              )}
            </section>
          </div>
        </div>

        {message ? (
          <p
            className={`mt-3 text-sm ${
              messageTone === "error"
                ? "text-rose-400"
                : messageTone === "success"
                  ? "text-emerald-400"
                  : "text-amber-300"
            }`}
          >
            {message}
          </p>
        ) : null}
      </section>
    </main>
  );
}
