import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@layouts/DashboardLayout';
import { RequireAuth } from '@features/auth';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { DashboardPage } from '@features/dashboard/pages/DashboardPage';
import { SociosPage } from '@features/socios/pages/SociosPage';
import { UnidadesPage } from '@features/unidades/pages/UnidadesPage';
import { VotacionesPage } from '@features/votacion/pages/VotacionesPage';
import { VotacionDetallePage } from '@features/votacion/pages/VotacionDetallePage';
import { ModulePage } from './ModulePage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'socios', element: <SociosPage /> },
          { path: 'vehiculos', element: <UnidadesPage /> },
          { path: 'unidades', element: <UnidadesPage /> },
          { path: 'votaciones', element: <VotacionesPage /> },
          { path: 'votaciones/:id', element: <VotacionDetallePage /> },
          { path: ':module', element: <ModulePage /> },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
