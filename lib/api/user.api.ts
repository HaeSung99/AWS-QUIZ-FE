import { api } from "@/lib/api-client";
import type {
  LearningStats,
  QuestionAttemptPayload,
  QuizQuestion,
  WeakCategory,
  WeaknessComment,
  WorkbookReview,
} from "./types";

export const userApi = {
  getLearningStats() {
    return api.get<LearningStats>("/auth/me/learning-stats").then((r) => r.data);
  },

  getWeakCategories() {
    return api.get<WeakCategory[]>("/auth/me/weak-categories").then((r) => r.data);
  },

  getGlobalWeakCategories() {
    return api.get<WeakCategory[]>("/auth/weak-categories/global").then((r) => r.data);
  },

  getWeaknessComment() {
    return api.get<WeaknessComment>("/auth/me/weakness-comment").then((r) => r.data);
  },

  getDailyQuestions(limit = 5) {
    return api
      .get<QuizQuestion[]>(`/auth/me/daily-questions?limit=${limit}`)
      .then((r) => r.data);
  },

  getRecommendedQuestions(limit = 20) {
    return api
      .get<QuizQuestion[]>(`/auth/me/recommended-questions?limit=${limit}`)
      .then((r) => r.data);
  },

  recordWorkbookAttempt(body: {
    workbookId?: string;
    correctCount: number;
    totalCount: number;
    questionAttempts: QuestionAttemptPayload[];
  }) {
    return api.post<void>("/auth/me/workbook-attempts", body);
  },

  markWorkbookSolved(workbookId: string) {
    return api
      .post<{ solvedWorkbookIds: string[] }>(
        `/auth/me/solved-workbooks/${workbookId}`,
        {},
      )
      .then((r) => r.data);
  },

  getWorkbookReview(workbookId: string) {
    return api
      .get<WorkbookReview>(
        `/auth/me/workbooks/${encodeURIComponent(workbookId)}/review`,
      )
      .then((r) => r.data);
  },
};
