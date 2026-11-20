import { ArrowUpRight, BadgeDollarSign, CarFront, Route, UsersRound, Plus, CalendarDays, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const stats = [
  { label: 'Socios registrados', value: '—', note: 'Conectaremos este dato a la API', icon: UsersRound, tone: 'blue' },
  { label: 'Vehículos activos', value: '—', note: 'Conectaremos este dato a la API', icon: CarFront, tone: 'green' },
  { label: 'Carreras del día', value: '—', note: 'Conectaremos este dato a la API', icon: Route, tone: 'purple' },
  { label: 'Pagos pendientes', value: '—', note: 'Conectaremos este dato a la API', icon: BadgeDollarSign, tone: 'orange' },
];

export function DashboardPage() {
  const { user } = useAuth();
  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow">RESUMEN GENERAL</div><h1>Panel principal</h1><p>Hola, {user?.name ?? 'Administrador'}. Aquí podrás revisar la actividad de tu cooperativa.</p></div>
        <button className="primary-button"><Plus size={17} /> Nueva carrera</button>
      </div>
      <div className="welcome-banner"><div className="welcome-copy"><span className="welcome-tag">POLE TAXICOOP</span><h2>Todo lo importante, en un solo lugar.</h2><p>Administra socios, conductores, vehículos y carreras desde tu panel.</p></div><div className="banner-art"><div className="sun"/><div className="road-line"/><div className="car-emoji">🚕</div></div></div>
      <div className="section-heading"><div><h2>Indicadores</h2><p>Resumen de la operación de la cooperativa</p></div><button className="date-filter"><CalendarDays size={16} /> Hoy <ArrowUpRight size={14} /></button></div>
      <div className="stats-grid">{stats.map(({ label, value, note, icon: Icon, tone }) => <article className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon size={19} /></div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span></article>)}</div>
      <div className="lower-grid"><section className="panel activity-panel"><div className="panel-heading"><div><h2>Actividad reciente</h2><p>Los movimientos aparecerán aquí</p></div><button className="text-button">Ver todo <ArrowRight size={15} /></button></div><div className="empty-state"><div className="empty-icon"><Route size={21} /></div><strong>Aún no hay actividad</strong><span>Cuando se conecte la API, verás aquí las novedades.</span></div></section><section className="panel shortcuts-panel"><div className="panel-heading"><div><h2>Accesos rápidos</h2><p>Ir directamente a una sección</p></div></div><div className="shortcut-list"><Link to="/socios"><span className="shortcut-icon blue"><UsersRound size={17}/></span><span>Registrar socio</span><ArrowRight size={15}/></Link><Link to="/vehiculos"><span className="shortcut-icon green"><CarFront size={17}/></span><span>Agregar vehículo</span><ArrowRight size={15}/></Link><Link to="/carreras"><span className="shortcut-icon purple"><Route size={17}/></span><span>Ver carreras</span><ArrowRight size={15}/></Link></div></section></div>
    </>
  );
}
