export type SessionUser = {
  id: string;
  email: string;
  roles: string[];
};

export type Session = {
  token: string;
  user: SessionUser;
};

const STORAGE_KEY = 'pole-taxicoop.session';

function readFrom(store: Storage): Session | null {
  const raw = store.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (typeof parsed.token === 'string' && parsed.user && typeof parsed.user.email === 'string') {
      return {
        token: parsed.token,
        user: {
          id: typeof parsed.user.id === 'string' ? parsed.user.id : '',
          email: parsed.user.email,
          roles: Array.isArray(parsed.user.roles)
            ? parsed.user.roles.filter((role): role is string => typeof role === 'string')
            : [],
        },
      };
    }
  } catch {
    // Sesión corrupta o formato anterior: se descarta.
  }

  return null;
}

export function readSession(): Session | null {
  return readFrom(localStorage) ?? readFrom(sessionStorage);
}

export function saveSession(session: Session, remember: boolean): void {
  clearSession();
  const store = remember ? localStorage : sessionStorage;
  store.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

export function getToken(): string | null {
  return readSession()?.token ?? null;
}
