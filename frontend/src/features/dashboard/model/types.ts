export type ActivityType = 'SOCIO' | 'UNIDAD' | 'EMERGENCIA' | 'VOTACION';

export type RecentActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  createdAt: string;
};

export type DashboardSummary = {
  counters: {
    socios: { total: number; activos: number };
    unidades: { total: number; operativas: number };
    emergencias: { total: number; pendientes: number };
    votacion: { total: number; activas: number };
  };
  recentActivity: RecentActivityItem[];
  generatedAt: string;
};
