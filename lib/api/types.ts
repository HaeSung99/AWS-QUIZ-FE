import type { AuthUser } from "@/lib/auth-client";

export type { AuthUser };

export type Notice = {
  id: string;
  title: string;
  body: string;
  pinned?: boolean;
  createdAt?: string | null;
};

export type Workbook = {
  id: string;
  certificationType: string;
  title: string;
  summary: string;
  questionCount: number;
  status?: "draft" | "published";
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type WorkbookBrief = Pick<Workbook, "id" | "title" | "certificationType">;

export type WorkbookAccuracy = {
  workbookId: string;
  title: string;
  accuracy: number;
  attemptCount: number;
};

export type WeakCategory = {
  category: string;
  totalCount: number;
  correctCount: number;
  wrongCount: number;
  wrongRate: number;
};

export type WeaknessComment = {
  comment: string;
  attemptCount: number;
  requiredAttemptCount: number;
  remainingAttemptCount: number;
  ready: boolean;
};

export type LearningStats = {
  overall: {
    totalCount: number;
    correctCount: number;
    accuracy: number | null;
  };
  workbooks: Array<{
    workbookId: string;
    title: string;
    accuracy: number;
    sessionCount: number;
    correctCount: number;
    totalCount: number;
  }>;
};

export type ReviewItem = {
  questionId: string;
  questionNumber: number;
  questionDescription: string;
  choices: string[];
  difficulty: string;
  questionCategory: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
};

export type ReviewSession = {
  submittedAt: string;
  accuracy: number;
  correctCount: number;
  totalCount: number;
  items: ReviewItem[];
};

export type WorkbookReview = {
  workbookId: string;
  title: string;
  sessions: ReviewSession[];
};

export type QuizQuestion = {
  id: string;
  questionNumber: number;
  questionDescription: string;
  choices: string[];
  answer: string;
  hint?: string;
  difficulty?: string;
  questionCategory?: string;
  certificationType?: string | null;
  similarity?: number;
  recommendReason?: string;
};

export type QuestionAttemptPayload = {
  questionId: string;
  questionCategory: string;
  difficulty: string;
  certificationType: string | null;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
};

export type AdminQuestionItem = {
  id: string;
  questionNumber: number;
  questionDescription: string;
  choices: string[];
  answer: string;
  hint: string;
  difficulty: string;
  questionCategory: string;
};

export type CategoryRecommendation = {
  category: string;
  score: number;
};

export type VisitorBreakdown = { human?: number; bot?: number; unknown?: number };

export type AdminOverview = {
  totalUsers: number;
  todayVisitors: number;
  dailySignups: Array<{ date: string; count: number } & VisitorBreakdown>;
  monthlySignups: Array<{ month: string; count: number } & VisitorBreakdown>;
  dailyVisitors: Array<{ date: string; count: number } & VisitorBreakdown>;
  monthlyVisitors: Array<{ month: string; count: number } & VisitorBreakdown>;
};

export type UserProfile = AuthUser;

export type EmailCodeResponse = {
  message?: string;
  devCode?: string;
};

export type EmailVerifyResponse = {
  verified?: boolean;
  message?: string;
};
