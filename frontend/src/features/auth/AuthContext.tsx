import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export type AuthUser = {
  name: string;
  email: string;
  role: string;
  initials: string;
};

export const demoCredentials = {
  identifier: 'admin',
  email: 'admin@poletaxicoop.com',
  password: 'taxicoop',
};

const STORAGE_KEY = 'pole-taxicoop.session';

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (typeof parsed.name === 'string' && typeof parsed.email === 'string') {
      return {
        name: parsed.name,
        email: parsed.email,
        role: typeof parsed.role === 'string' ? parsed.role : 'Gestión general',
        initials: typeof parsed.initials === 'string' ? parsed.initials : 'AD',
      };
    }
  } catch {
    // Sesión local corrupta: se descarta y se pide iniciar sesión de nuevo.
  }
  return null;
}

type AuthContextValue = {
  user: AuthUser | null;
  signIn: (identifier: string, password: string, remember: boolean) => Promise<AuthUser>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const signIn = useCallback(async (identifier: string, password: string, remember: boolean) => {
    // Validación local de demostración: no se llama a la API.
    await new Promise((resolve) => window.setTimeout(resolve, 850));

    const normalized = identifier.trim().toLowerCase();
    const isKnownUser = normalized === demoCredentials.identifier || normalized === demoCredentials.email;

    if (!isKnownUser || password !== demoCredentials.password) {
      throw new Error('Usuario o contraseña incorrectos. Prueba con el acceso demo.');
    }

    const nextUser: AuthUser = {
      name: 'Administrador',
      email: normalized === demoCredentials.email ? demoCredentials.email : 'admin@poletaxicoop.com',
      role: 'Gestión general',
      initials: 'AD',
    };

    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return context;
}

export function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <Outlet />;
}
