export const ADMIN_HEADER = 'x-admin-key';

// Server-side key (do not expose). Provide via env in production.
export const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'dev-admin-key';

export function isValidAdminRequest(request: Request): boolean {
  const header = request.headers.get(ADMIN_HEADER);
  return Boolean(header && header === ADMIN_API_KEY);
}


