import { api } from "@/lib/api-client";
import type {
  AdminOverview,
  AdminQuestionItem,
  CategoryRecommendation,
  Notice,
  Workbook,
  WorkbookAccuracy,
} from "./types";

export const adminApi = {
  getOverview() {
    return api.get<AdminOverview>("/admin/stats/overview").then((r) => r.data);
  },

  getNotices() {
    return api.get<Notice[]>("/admin/notices").then((r) => r.data);
  },

  createNotice(body: { title: string; body: string; pinned: boolean }) {
    return api.post<Notice>("/admin/notices", body).then((r) => r.data);
  },

  updateNotice(
    noticeId: string,
    body: { title: string; body: string; pinned: boolean },
  ) {
    return api.patch<Notice>(`/admin/notices/${noticeId}`, body).then((r) => r.data);
  },

  deleteNotice(noticeId: string) {
    return api.delete<void>(`/admin/notices/${noticeId}`);
  },

  getWorkbooks() {
    return api.get<Workbook[]>("/admin/questions").then((r) => r.data);
  },

  createWorkbook(body: {
    certificationType: string;
    title: string;
    summary: string;
    questionCount: number;
  }) {
    return api.post<Workbook>("/admin/questions", body).then((r) => r.data);
  },

  updateWorkbook(
    workbookId: string,
    body: Partial<{
      certificationType: string;
      title: string;
      summary: string;
      questionCount: number;
      status: "draft" | "published";
    }>,
  ) {
    return api.patch<Workbook>(`/admin/questions/${workbookId}`, body).then((r) => r.data);
  },

  deleteWorkbook(workbookId: string) {
    return api.delete<void>(`/admin/questions/${workbookId}`);
  },

  getWorkbookItems(workbookId: string) {
    return api
      .get<AdminQuestionItem[]>(`/admin/questions/${workbookId}/items`)
      .then((r) => r.data);
  },

  createWorkbookItem(
    workbookId: string,
    body: {
      questionNumber: number;
      questionDescription: string;
      choices: string[];
      answer: string;
      hint: string;
      difficulty: string;
      questionCategory: string;
    },
  ) {
    return api
      .post<AdminQuestionItem>(`/admin/questions/${workbookId}/items`, body)
      .then((r) => r.data);
  },

  updateWorkbookItem(
    workbookId: string,
    itemId: string,
    body: {
      questionNumber: number;
      questionDescription: string;
      choices: string[];
      answer: string;
      hint: string;
      difficulty: string;
      questionCategory: string;
    },
  ) {
    return api
      .patch<AdminQuestionItem>(
        `/admin/questions/${workbookId}/items/${itemId}`,
        body,
      )
      .then((r) => r.data);
  },

  deleteWorkbookItem(workbookId: string, itemId: string) {
    return api.delete<void>(`/admin/questions/${workbookId}/items/${itemId}`);
  },

  getQuestionCategories() {
    return api.get<string[]>("/admin/question-categories").then((r) => r.data);
  },

  recommendQuestionCategory(body: {
    questionDescription: string;
    choices: string[];
    answer: string;
    hint: string;
    difficulty: string;
    categories: { value: string }[];
  }) {
    return api
      .post<CategoryRecommendation[]>("/admin/question-categories/recommend", body)
      .then((r) => r.data);
  },

  getWorkbookAccuracy() {
    return api.get<WorkbookAccuracy[]>("/public/workbooks/accuracy").then((r) => r.data);
  },
};
