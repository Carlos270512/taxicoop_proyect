import { ArrowRight, CarFront, CheckCircle2, ChevronRight, ShieldAlert, ShieldCheck, Vote, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@components/Badge';
import { EmptyState } from '@components/EmptyState';
import { PageHeader } from '@components/PageHeader';
import { StatCard } from '@components/StatCard';
import { useAuth } from '@features/auth';
import { formatDate, useMiPerfil } from '@features/perfil';
import { formatFechaLarga, useMisReuniones } from '@features/reuniones';
import { UnidadStatusBadge } from '@features/unidades';
import { formatPeriod, useActiveElections } from '@features/votacion';
import { getApiErrorMessage } from '@shared/api/errors';

export function SocioDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useMiPerfil();
  const { data: activeElections } = useActiveElections();
  const { data: misReuniones } = useMisReuniones();

  const socio = data?.socio;
  const unidades = data?.unidades ?? [];
  const operativas = unidades.filter((unidad) => unidad.estado === 'OPERATIVA').length;
  const elecciones = activeElections ?? [];
  const pendientes = elecciones.filter((election) => !election.hasVoted).length;
  const reuniones = (misReuniones ?? []).slice(0, 3);

  const greeting = socio ? `${socio.nombres} ${socio.apellidos}` : user?.name ?? 'Socio';

  return (
    <>
      <PageHeader
        eyebrow="MI PANEL"
        title={`Hola, ${greeting}`}
        subtitle="Este es tu espacio como socio: tu estado, tus unidades y las votaciones abiertas."
      />

      {isError ? (
        <div className="inline-alert" role="alert">
          <ShieldAlert size={15} />
          <span>{getApiErrorMessage(error, 'No se pudo cargar tu información de socio.')}</span>
        </div>
      ) : null}

      <div className="socio-banner">
        <div>
          <h2>{isLoading ? 'Cargando tu información…' : greeting}</h2>
          <p>
            {socio
              ? `C.I./RUC ${socio.cedulaRuc} · ${unidades.length} ${unidades.length === 1 ? 'unidad registrada' : 'unidades registradas'}`
              : 'Socio de Pole Taxicoop'}
          </p>
        </div>
        {socio ? (
          <span className="banner-badge">
            <ShieldCheck size={14} /> Socio {socio.estado.toLowerCase()}
          </span>
        ) : null}
      </div>

      <div className="stats-grid">
        <StatCard
          label="Estado del socio"
          value={socio ? socio.estado : '—'}
          note={socio ? `Socio desde ${formatDate(socio.createdAt)}` : isLoading ? 'Cargando…' : 'Sin datos'}
          icon={ShieldCheck}
          tone="green"
        />
        <StatCard
          label="Unidades registradas"
          value={socio ? String(unidades.length) : '—'}
          note={socio ? `${operativas} ${operativas === 1 ? 'operativa' : 'operativas'}` : isLoading ? 'Cargando…' : 'Sin datos'}
          icon={CarFront}
          tone="blue"
        />
        <StatCard
          label="Unidades operativas"
          value={socio ? String(operativas) : '—'}
          note={socio ? `${unidades.length - operativas} fuera de operación` : isLoading ? 'Cargando…' : 'Sin datos'}
          icon={CheckCircle2}
          tone="purple"
        />
        <StatCard
          label="Votaciones abiertas"
          value={String(elecciones.length)}
          note={
            pendientes === 0
              ? 'Estás al día'
              : `${pendientes} ${pendientes === 1 ? 'pendiente' : 'pendientes'} de votar`
          }
          icon={Vote}
          tone="orange"
        />      </div>

      <div className="socio-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Votaciones abiertas</h2>
              <p>Participa en las decisiones de la cooperativa</p>
            </div>
            <Link to="/votaciones" className="text-button">
              Ver todas <ArrowRight size={15} />
            </Link>
          </div>

          {elecciones.length === 0 ? (
            <EmptyState
              icon={Vote}
              title="No hay votaciones abiertas"
              description="Cuando la cooperativa abra una votación aparecerá aquí."
            />
          ) : (
            <div className="socio-list">
              {elecciones.map((election) => (
                <Link key={election.id} to={`/votaciones/${election.id}`} className="socio-list-row">
                  <div className="socio-list-main">
                    <strong>{election.title}</strong>
                    <span>{formatPeriod(election.startDate, election.endDate)}</span>
                  </div>
                  {election.hasVoted ? <Badge tone="green">Ya votaste</Badge> : <Badge tone="orange">Pendiente</Badge>}
                  <ChevronRight size={16} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Mis reuniones</h2>
              <p>Tu asistencia a las últimas reuniones</p>
            </div>
            <Link to="/reuniones" className="text-button">
              Ver todas <ArrowRight size={15} />
            </Link>
          </div>

          {reuniones.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="Sin reuniones registradas"
              description="Cuando la cooperativa registre una reunión verás aquí tu asistencia."
            />
          ) : (
            <div className="socio-list">
              {reuniones.map((reunion) => (
                <Link key={reunion.id} to="/reuniones" className="socio-list-row">
                  <div className="socio-list-main">
                    <strong>{reunion.titulo}</strong>
                    <span>{formatFechaLarga(reunion.fecha)}</span>
                  </div>
                  {reunion.asistencia === 'PRESENTE' ? (
                    <Badge tone="green">Presente</Badge>
                  ) : reunion.asistencia === 'AUSENTE' ? (
                    <Badge tone="red">Ausente</Badge>
                  ) : (
                    <Badge tone="gray">Sin registrar</Badge>
                  )}
                  <ChevronRight size={16} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Mis unidades</h2>
              <p>Vehículos a tu nombre</p>
            </div>
            <Link to="/perfil" className="text-button">
              Mi perfil <ArrowRight size={15} />
            </Link>
          </div>

          {unidades.length === 0 ? (
            <EmptyState
              icon={CarFront}
              title="Sin unidades registradas"
              description="El administrador registrará tus vehículos en el sistema."
            />
          ) : (
            <div className="socio-list">
              {unidades.map((unidad) => (
                <div key={unidad.id} className="socio-list-row static">
                  <div className="socio-list-main">
                    <strong>{unidad.numeroUnidad}</strong>
                    <span>
                      Placa {unidad.placa} · Año {unidad.anioVehiculo}
                    </span>
                  </div>
                  <UnidadStatusBadge estado={unidad.estado} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
