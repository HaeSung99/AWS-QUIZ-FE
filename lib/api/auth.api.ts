import type { AuthTokenResponse } from "@/lib/auth-client";
import { api } from "@/lib/api-client";
import { fetchRefreshToken } from "./auth-refresh";
import type { EmailCodeResponse, EmailVerifyResponse, UserProfile } from "./types";

export const authApi = {
  login(body: { email: string; password: string }) {
    return api.post<AuthTokenResponse>("/auth/login", body).then((r) => r.data);
  },

  signup(body: {
    name: string;
    email: string;
    password: string;
    targetCertificationType: string | null;
  }) {
    return api.post<AuthTokenResponse>("/auth/signup", body).then((r) => r.data);
  },

  logout() {
    return api.post<void>("/auth/logout");
  },

  me() {
    return api.get<{ user: UserProfile }>("/auth/me").then((r) => r.data);
  },

  refresh(refreshToken: string) {
    return fetchRefreshToken(refreshToken);
  },

  sendEmailCode(email: string) {
    return api.post<EmailCodeResponse>("/auth/email/send-code", { email }).then((r) => r.data);
  },

  verifyEmailCode(email: string, code: string) {
    return api
      .post<EmailVerifyResponse>("/auth/email/verify", { email, code })
      .then((r) => r.data);
  },

  sendPasswordResetCode(email: string) {
    return api
      .post<EmailCodeResponse>("/auth/password/send-reset-code", { email })
      .then((r) => r.data);
  },

  verifyPasswordResetCode(email: string, code: string) {
    return api
      .post<EmailVerifyResponse>("/auth/password/verify-reset-code", { email, code })
      .then((r) => r.data);
  },

  resetPassword(email: string, newPassword: string) {
    return api
      .post<{ message?: string }>("/auth/password/reset", { email, newPassword })
      .then((r) => r.data);
  },

  updateTargetCertification(targetCertificationType: string | null) {
    return api
      .patch<{ user: UserProfile }>("/auth/me/target-certification", {
        targetCertificationType,
      })
      .then((r) => r.data);
  },

  changePassword(currentPassword: string, newPassword: string) {
    return api
      .patch<void>("/auth/me/password", { currentPassword, newPassword })
      .then((r) => r.data);
  },
};
