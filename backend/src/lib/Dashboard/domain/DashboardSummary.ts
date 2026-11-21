export type DashboardCounters = {
  socios: { total: number; activos: number };
  unidades: { total: number; operativas: number };
  emergencias: { total: number; pendientes: number };
  votacion: { total: number; activas: number };
};

export type RecentActivityItem = {
  id: string;
  type: 'SOCIO' | 'UNIDAD' | 'EMERGENCIA' | 'VOTACION';
  title: string;
  subtitle: string;
  createdAt: string;
};

export type DashboardSummary = {
  counters: DashboardCounters;
  recentActivity: RecentActivityItem[];
  generatedAt: string;
};
