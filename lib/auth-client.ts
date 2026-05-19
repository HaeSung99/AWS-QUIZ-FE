/** 같은 탭에서 localStorage 인증 변경 시 헤더 등이 구독할 이벤트 (`storage`는 다른 탭에서만 발생) */
export const AUTH_STORAGE_CHANGED_EVENT = "aws-quiz-auth-storage-changed";

const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY;

export function notifyAuthStorageChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_STORAGE_CHANGED_EVENT));
}

/** 저장된 액세스 토큰·유저 정보 제거 후 구독 컴포넌트에 알림 */
export function clearClientAuthStorage(): void {
  if (typeof window === "undefined" || !ACCESS_TOKEN_KEY || !AUTH_USER_KEY)
    return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  notifyAuthStorageChanged();
}
