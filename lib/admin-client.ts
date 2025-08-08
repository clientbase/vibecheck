// Client-side helpers for storing and sending the admin API key

export const ADMIN_KEY_STORAGE = 'vc_admin_api_key';
export const ADMIN_HEADER = 'x-admin-key';

export function getStoredAdminKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ADMIN_KEY_STORAGE);
  } catch {
    return null;
  }
}

export function setStoredAdminKey(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_KEY_STORAGE, key);
}

export function clearStoredAdminKey() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_KEY_STORAGE);
}

export function withAdminHeader(init?: RequestInit): RequestInit {
  const key = getStoredAdminKey();
  const headers = new Headers(init?.headers || {});
  if (key) headers.set(ADMIN_HEADER, key);
  return { ...init, headers };
}


