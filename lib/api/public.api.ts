import { api } from "@/lib/api-client";
import type { Notice, QuizQuestion, Workbook, WorkbookAccuracy } from "./types";

export const publicApi = {
  getNotices() {
    return api.get<Notice[]>("/public/notices").then((r) => r.data);
  },

  getWorkbooks() {
    return api.get<Workbook[]>("/public/workbooks").then((r) => r.data);
  },

  getWorkbookAccuracy() {
    return api.get<WorkbookAccuracy[]>("/public/workbooks/accuracy").then((r) => r.data);
  },

  getWorkbookItems(workbookId: string) {
    return api
      .get<QuizQuestion[]>(`/public/workbooks/${workbookId}/items`)
      .then((r) => r.data);
  },

  getQuestionsByCategory(category: string, limit = 20) {
    return api
      .get<QuizQuestion[]>(
        `/public/questions/by-category?category=${encodeURIComponent(category)}&limit=${limit}`,
      )
      .then((r) => r.data);
  },

  trackVisit(body: {
    clientKey: string;
    eventType: string;
    isLoggedIn: boolean;
  }) {
    return api.post<void>("/public/track-visit", body);
  },
};

/** SSR용 — axios 인터셉터 없이 공지 목록 조회 */
export async function fetchNoticesForServer(baseUrl: string): Promise<Notice[]> {
  try {
    const res = await fetch(`${baseUrl}/public/notices`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as Notice[]) : [];
  } catch {
    return [];
  }
}
