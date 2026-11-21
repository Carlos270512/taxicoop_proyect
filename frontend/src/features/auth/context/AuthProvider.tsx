import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import axios from 'axios';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { clearSession, readSession, saveSession } from '@shared/auth/session';
import type { SessionUser } from '@shared/auth/session';
import { authApi } from '../api/auth.api';
import type { AuthUser } from '../model/types';

function toAuthUser(user: SessionUser): AuthUser {
  const local = user.email.split('@')[0] || user.email;
  return {
    name: local.charAt(0).toUpperCase() + local.slice(1),
    email: user.email,
    role: user.roles.length > 0 ? user.roles.join(' · ') : 'Sin rol asignado',
    roles: user.roles,
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
      const session = await authApi.login(email.trim(), password);
      saveSession(session, remember);
      const nextUser = toAuthUser(session.user);
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
