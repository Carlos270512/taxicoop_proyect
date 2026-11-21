import type { SessionUser } from '@shared/auth/session';

export type { SessionUser };

export type AuthUser = {
  name: string;
  email: string;
  role: string;
  initials: string;
};
