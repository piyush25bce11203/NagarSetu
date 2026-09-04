/**
 * NagarSetu – localStorage persistence layer
 */

import { Report } from '../types';

const KEYS = {
  USERS:   'nagarsetu_users',
  REPORTS: 'nagarsetu_reports_v3',
  SESSION: 'nagarsetu_session',
} as const;

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  district: string;
  language: string;
  isOnline: boolean;
  coordinates: { lat: number; lng: number };
  loggedInAt: string;
}

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function lsSet<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function hashPassword(pw: string): string { return btoa(encodeURIComponent(pw)); }
function verifyPassword(pw: string, hash: string): boolean { return hashPassword(pw) === hash; }

// ── Users ─────────────────────────────────────────────────────────────────────
export const UserStore = {
  getAll(): StoredUser[] { return lsGet<StoredUser[]>(KEYS.USERS, []); },
  findByEmail(email: string): StoredUser | undefined {
    return this.getAll().find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  exists(email: string): boolean { return !!this.findByEmail(email); },
  register(data: { name: string; email: string; phone: string; password: string }): StoredUser {
    const user: StoredUser = {
      id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: data.name, email: data.email.toLowerCase(), phone: data.phone,
      passwordHash: hashPassword(data.password), createdAt: new Date().toISOString(),
    };
    lsSet(KEYS.USERS, [...this.getAll(), user]);
    return user;
  },
  authenticate(email: string, password: string): StoredUser | null {
    const user = this.findByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) return null;
    return user;
  },
};

// ── Session ───────────────────────────────────────────────────────────────────
export const SessionStore = {
  get(): Session | null { return lsGet<Session | null>(KEYS.SESSION, null); },
  save(session: Session): void { lsSet(KEYS.SESSION, session); },
  update(patch: Partial<Session>): void {
    const current = this.get();
    if (current) lsSet(KEYS.SESSION, { ...current, ...patch });
  },
  clear(): void { localStorage.removeItem(KEYS.SESSION); },
};

// ── Reports ───────────────────────────────────────────────────────────────────
function serialiseReport(r: Report): object {
  return {
    ...r,
    timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : r.timestamp,
    comments: r.comments.map(c => ({
      ...c,
      timestamp: c.timestamp instanceof Date ? c.timestamp.toISOString() : c.timestamp,
    })),
  };
}

function deserialiseReport(raw: Record<string, unknown>): Report {
  return {
    ...(raw as Report),
    timestamp: new Date(raw.timestamp as string),
    comments: ((raw.comments as Record<string, unknown>[]) || []).map(c => ({
      ...(c as Report['comments'][number]),
      timestamp: new Date(c.timestamp as string),
    })),
  };
}

export const ReportStore = {
  getAll(): Report[] {
    return lsGet<Record<string, unknown>[]>(KEYS.REPORTS, []).map(deserialiseReport);
  },
  seedIfEmpty(seedReports: Report[]): Report[] {
    const existing = this.getAll();
    if (existing.length > 0) return existing;
    lsSet(KEYS.REPORTS, seedReports.map(serialiseReport));
    return seedReports;
  },
  save(reports: Report[]): void {
    lsSet(KEYS.REPORTS, reports.map(serialiseReport));
  },
  add(report: Report): Report[] {
    const updated = [report, ...this.getAll()];
    this.save(updated);
    return updated;
  },
  update(id: string, patch: Partial<Report>): Report[] {
    const all = this.getAll().map(r => r.id === id ? { ...r, ...patch } : r);
    this.save(all);
    return all;
  },
};
