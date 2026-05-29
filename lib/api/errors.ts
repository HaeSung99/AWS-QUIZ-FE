import { isAxiosError } from "axios";

export function getApiErrorMessage(
  err: unknown,
  fallback = "요청 처리 중 오류가 발생했습니다.",
): string {
  if (isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string" && msg) return msg;
    return err.message || fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function isUnauthorizedError(err: unknown): boolean {
  return isAxiosError(err) && err.response?.status === 401;
}
