'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export interface Session {
  userId:    number;
  firstName: string;
  lastName:  string;
  email:     string;
  roleName:  string;
}

export function readSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('session');
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function useSession(): Session | null {
  const [session, setSession] = useState<Session | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setSession(readSession());
  }, [pathname]);

  return session;
}