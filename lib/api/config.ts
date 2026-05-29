export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function isApiConfigured(): boolean {
  return Boolean(API_BASE_URL);
}

export function isAuthStorageConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY &&
      process.env.NEXT_PUBLIC_AUTH_REFRESH_TOKEN_KEY &&
      process.env.NEXT_PUBLIC_AUTH_USER_KEY,
  );
}
