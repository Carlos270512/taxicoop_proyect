import { useAuth } from '@features/auth';
import { DashboardPage } from '@features/dashboard/pages/DashboardPage';
import { SocioDashboardPage } from '@features/dashboard/pages/SocioDashboardPage';

/** Panel de inicio según el rol: el administrador ve la operación, el socio su espacio. */
export function HomePage() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('ADMIN') ?? false;

  return isAdmin ? <DashboardPage /> : <SocioDashboardPage />;
}
