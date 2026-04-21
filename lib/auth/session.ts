import { cookies } from 'next/headers';

export interface SessionPayload {
  userId:    number;
  firstName: string;
  lastName:  string;
  email:     string;
  roleName:  string;
}

export function getSessionFromCookies(): SessionPayload | null {
  const raw = cookies().get('session')?.value;
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as SessionPayload;
    if (s.roleName === undefined || s.roleName === null || String(s.roleName) === '') return null;
    const userId = Number(s.userId);
    if (!Number.isFinite(userId)) return null;
    return { ...s, userId };
  } catch {
    return null;
  }
}
