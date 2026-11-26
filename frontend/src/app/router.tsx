import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { DashboardLayout } from '@layouts/DashboardLayout';
import { RequireAuth, RequireRole } from '@features/auth';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { SociosPage } from '@features/socios/pages/SociosPage';
import { UnidadesPage } from '@features/unidades/pages/UnidadesPage';
import { MiPerfilPage } from '@features/perfil/pages/MiPerfilPage';
import { PostulacionPublicaPage } from '@features/solicitudes/pages/PostulacionPublicaPage';
import { MapaPage } from '@features/mapa/pages/MapaPage';
import { ReglamentosPage } from '@features/reglamento/pages/ReglamentosPage';
import { VotacionesPage } from '@features/votacion/pages/VotacionesPage';
import { VotacionDetallePage } from '@features/votacion/pages/VotacionDetallePage';
import { HomePage } from './HomePage';
import { ModulePage } from './ModulePage';

const adminOnly = (element: ReactNode) => <RequireRole roles={['ADMIN']}>{element}</RequireRole>;

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/postulacion/:token', element: <PostulacionPublicaPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'perfil', element: <MiPerfilPage /> },
          { path: 'socios', element: adminOnly(<SociosPage />) },
          { path: 'reglamento', element: <ReglamentosPage /> },
          { path: 'vehiculos', element: adminOnly(<UnidadesPage />) },
          { path: 'unidades', element: adminOnly(<UnidadesPage />) },
          { path: 'votaciones', element: <VotacionesPage /> },
          { path: 'votaciones/:id', element: <VotacionDetallePage /> },
          { path: 'mapa', element: adminOnly(<MapaPage />) },
          { path: ':module', element: adminOnly(<ModulePage />) },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
