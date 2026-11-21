import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import axios from 'axios';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { clearSession, readSession, saveSession, type SessionUser } from '../../services/session';

export type AuthUser = {
  name: string;
  email: string;
  role: string;
  initials: string;
};

type LoginEnvelope = {
  success: boolean;
  data: {
    token: string;
    user: SessionUser;
  };
};

function toAuthUser(user: SessionUser): AuthUser {
  const local = user.email.split('@')[0] || user.email;
  return {
    name: local.charAt(0).toUpperCase() + local.slice(1),
    email: user.email,
    role: user.roles.length > 0 ? user.roles.join(' · ') : 'Sin rol asignado',
    initials: local.slice(0, 2).toUpperCase(),
  };
}

function loginErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté en línea.';
    }
    if (error.response.status === 401) {
      return 'Correo o contraseña incorrectos.';
    }
    const data = error.response.data as { error?: string } | undefined;
    if (data?.error) return data.error;
  }
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}

function initialUser(): AuthUser | null {
  const session = readSession();
  return session ? toAuthUser(session.user) : null;
}

type AuthContextValue = {
  user: AuthUser | null;
  signIn: (email: string, password: string, remember: boolean) => Promise<AuthUser>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  const signIn = useCallback(async (email: string, password: string, remember: boolean) => {
    try {
      const { data } = await api.post<LoginEnvelope>('/auth/login', {
        email: email.trim(),
        password,
      });
      saveSession(data.data, remember);
      const nextUser = toAuthUser(data.data.user);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      throw new Error(loginErrorMessage(error));
    }
  }, []);

  const signOut = useCallback(() => {
    clearSession();
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
