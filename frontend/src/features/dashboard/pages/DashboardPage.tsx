import { ArrowRight, ArrowUpRight, CalendarDays, CarFront, Plus, ShieldAlert, UsersRound, Vote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@components/PageHeader';
import { StatCard } from '@components/StatCard';
import { useAuth } from '@features/auth';
import { RecentActivity } from '../components/RecentActivity';
import { useDashboardSummary } from '../hooks/useDashboardSummary';

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  const counters = data?.counters;

  const stats = [
    {
      label: 'Socios registrados',
      value: counters ? String(counters.socios.total) : '—',
      note: counters ? `${counters.socios.activos} activos` : isLoading ? 'Cargando…' : 'Sin datos',
      icon: UsersRound,
      tone: 'blue' as const,
    },
    {
      label: 'Unidades',
      value: counters ? String(counters.unidades.total) : '—',
      note: counters ? `${counters.unidades.operativas} operativas` : isLoading ? 'Cargando…' : 'Sin datos',
      icon: CarFront,
      tone: 'green' as const,
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
      tone: 'orange' as const,
    },
    {
      label: 'Votaciones activas',
      value: counters ? String(counters.votacion.activas) : '—',
      note: counters ? `${counters.votacion.total} en total` : isLoading ? 'Cargando…' : 'Sin datos',
      icon: Vote,
      tone: 'purple' as const,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="RESUMEN GENERAL"
        title="Panel principal"
        subtitle={`Hola, ${user?.name ?? 'Administrador'}. Aquí podrás revisar la actividad de tu cooperativa.`}
        action={
          <button className="primary-button">
            <Plus size={17} /> Nueva carrera
          </button>
        }
      />
      <div className="welcome-banner"><div className="welcome-copy"><span className="welcome-tag">POLE TAXICOOP</span><h2>Todo lo importante, en un solo lugar.</h2><p>Administra socios, conductores, vehículos y carreras desde tu panel.</p></div><div className="banner-art"><div className="sun"/><div className="road-line"/><div className="car-emoji">🚕</div></div></div>
      <div className="section-heading"><div><h2>Indicadores</h2><p>Resumen de la operación de la cooperativa</p></div><button className="date-filter"><CalendarDays size={16} /> Hoy <ArrowUpRight size={14} /></button></div>
      {isError && (
        <div className="dashboard-alert">
          <ShieldAlert size={15} />
          <span>No se pudo cargar el resumen. Revisa la conexión con el backend.</span>
          <button type="button" onClick={() => refetch()}>Reintentar</button>
        </div>
      )}
      <div className="stats-grid">{stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</div>
      <div className="lower-grid"><section className="panel activity-panel"><div className="panel-heading"><div><h2>Actividad reciente</h2><p>Últimos movimientos registrados</p></div><button className="text-button">Ver todo <ArrowRight size={15} /></button></div><RecentActivity items={data?.recentActivity ?? []} isLoading={isLoading} /></section><section className="panel shortcuts-panel"><div className="panel-heading"><div><h2>Accesos rápidos</h2><p>Ir directamente a una sección</p></div></div><div className="shortcut-list"><Link to="/socios"><span className="shortcut-icon blue"><UsersRound size={17}/></span><span>Registrar socio</span><ArrowRight size={15}/></Link><Link to="/vehiculos"><span className="shortcut-icon green"><CarFront size={17}/></span><span>Agregar vehículo</span><ArrowRight size={15}/></Link><Link to="/votaciones"><span className="shortcut-icon purple"><Vote size={17}/></span><span>Ver votaciones</span><ArrowRight size={15}/></Link></div></section></div>
    </>
  );
}
