import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CarFront,
  Plus,
  Route,
  ShieldAlert,
  UsersRound,
  Vote,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../auth/AuthContext';

type ActivityType = 'SOCIO' | 'UNIDAD' | 'EMERGENCIA' | 'VOTACION';

type RecentActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  createdAt: string;
};

type DashboardSummary = {
  counters: {
    socios: { total: number; activos: number };
    unidades: { total: number; operativas: number };
    emergencias: { total: number; pendientes: number };
    votacion: { total: number; activas: number };
  };
  recentActivity: RecentActivityItem[];
  generatedAt: string;
};

async function fetchSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<{ success: boolean; data: DashboardSummary }>('/dashboard/summary');
  return data.data;
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}

const activityAppearance: Record<ActivityType, { icon: typeof UsersRound; tone: string }> = {
  SOCIO: { icon: UsersRound, tone: 'blue' },
  UNIDAD: { icon: CarFront, tone: 'green' },
  EMERGENCIA: { icon: ShieldAlert, tone: 'orange' },
  VOTACION: { icon: Vote, tone: 'purple' },
};

export function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchSummary,
  });

  const counters = data?.counters;

  const stats = [
    {
      label: 'Socios registrados',
      value: counters ? String(counters.socios.total) : '—',
      note: counters ? `${counters.socios.activos} activos` : isLoading ? 'Cargando…' : 'Sin datos',
      icon: UsersRound,
      tone: 'blue',
    },
    {
      label: 'Unidades',
      value: counters ? String(counters.unidades.total) : '—',
      note: counters ? `${counters.unidades.operativas} operativas` : isLoading ? 'Cargando…' : 'Sin datos',
      icon: CarFront,
      tone: 'green',
    },
    {
      label: 'Alertas pendientes',
      value: counters ? String(counters.emergencias.pendientes) : '—',
      note: counters
        ? `${counters.emergencias.total} ${counters.emergencias.total === 1 ? 'alerta' : 'alertas'} en total`
        : isLoading
          ? 'Cargando…'
          : 'Sin datos',
      icon: ShieldAlert,
      tone: 'orange',
    },
    {
      label: 'Votaciones activas',
      value: counters ? String(counters.votacion.activas) : '—',
      note: counters ? `${counters.votacion.total} en total` : isLoading ? 'Cargando…' : 'Sin datos',
      icon: Vote,
      tone: 'purple',
    },
  ];

  const recent = data?.recentActivity ?? [];

  const activityContent = isLoading ? (
    <div className="empty-state">
      <div className="empty-icon"><Route size={21} /></div>
      <strong>Cargando actividad…</strong>
      <span>Consultando los últimos movimientos</span>
    </div>
  ) : recent.length === 0 ? (
    <div className="empty-state">
      <div className="empty-icon"><Route size={21} /></div>
      <strong>Aún no hay actividad</strong>
      <span>Cuando registres socios, unidades o alertas aparecerán aquí.</span>
    </div>
  ) : (
    <div className="activity-list">
      {recent.map((item) => {
        const { icon: Icon, tone } = activityAppearance[item.type];
        return (
          <div className="activity-item" key={`${item.type}-${item.id}`}>
            <span className={`activity-icon ${tone}`}><Icon size={15} /></span>
            <div className="activity-copy">
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </div>
            <span className="activity-time">{timeAgo(item.createdAt)}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow">RESUMEN GENERAL</div><h1>Panel principal</h1><p>Hola, {user?.name ?? 'Administrador'}. Aquí podrás revisar la actividad de tu cooperativa.</p></div>
        <button className="primary-button"><Plus size={17} /> Nueva carrera</button>
      </div>
      <div className="welcome-banner"><div className="welcome-copy"><span className="welcome-tag">POLE TAXICOOP</span><h2>Todo lo importante, en un solo lugar.</h2><p>Administra socios, conductores, vehículos y carreras desde tu panel.</p></div><div className="banner-art"><div className="sun"/><div className="road-line"/><div className="car-emoji">🚕</div></div></div>
      <div className="section-heading"><div><h2>Indicadores</h2><p>Resumen de la operación de la cooperativa</p></div><button className="date-filter"><CalendarDays size={16} /> Hoy <ArrowUpRight size={14} /></button></div>
      {isError && (
        <div className="dashboard-alert">
          <ShieldAlert size={15} />
          <span>No se pudo cargar el resumen. Revisa la conexión con el backend.</span>
          <button type="button" onClick={() => refetch()}>Reintentar</button>
        </div>
      )}
      <div className="stats-grid">{stats.map(({ label, value, note, icon: Icon, tone }) => <article className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon size={19} /></div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span></article>)}</div>
      <div className="lower-grid"><section className="panel activity-panel"><div className="panel-heading"><div><h2>Actividad reciente</h2><p>Últimos movimientos registrados</p></div><button className="text-button">Ver todo <ArrowRight size={15} /></button></div>{activityContent}</section><section className="panel shortcuts-panel"><div className="panel-heading"><div><h2>Accesos rápidos</h2><p>Ir directamente a una sección</p></div></div><div className="shortcut-list"><Link to="/socios"><span className="shortcut-icon blue"><UsersRound size={17}/></span><span>Registrar socio</span><ArrowRight size={15}/></Link><Link to="/vehiculos"><span className="shortcut-icon green"><CarFront size={17}/></span><span>Agregar vehículo</span><ArrowRight size={15}/></Link><Link to="/carreras"><span className="shortcut-icon purple"><Route size={17}/></span><span>Ver carreras</span><ArrowRight size={15}/></Link></div></section></div>
    </>
  );
}
