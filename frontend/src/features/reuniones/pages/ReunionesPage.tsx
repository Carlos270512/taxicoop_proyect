import { useState } from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, MinusCircle, Plus, Trash2, UsersRound, Vote, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@components/Badge';
import { Button } from '@components/Button';
import { EmptyState } from '@components/EmptyState';
import { Modal } from '@components/Modal';
import { PageHeader } from '@components/PageHeader';
import { useAuth } from '@features/auth';
import { getApiErrorMessage } from '@shared/api/errors';
import { ReunionAsistencia } from '../components/ReunionAsistencia';
import { ReunionFormModal } from '../components/ReunionFormModal';
import { useMisReuniones, useReuniones, useReunionMutations } from '../hooks/useReuniones';
import { formatFechaLarga, porcentajeAsistencia } from '../model/types';
import type { MiReunion, Reunion } from '../model/types';

function EstadoBadge({ estado }: { estado: MiReunion['asistencia'] }) {
  if (estado === 'PRESENTE') return <Badge tone="green">Presente</Badge>;
  if (estado === 'AUSENTE') return <Badge tone="red">Ausente</Badge>;
  return <Badge tone="gray">Sin registrar</Badge>;
}

/** Historial de reuniones del socio (solo lectura). */
function MisReuniones() {
  const { data, isLoading, isError, error } = useMisReuniones();
  const reuniones = data ?? [];

  const presentes = reuniones.filter((reunion) => reunion.asistencia === 'PRESENTE').length;
  const porcentaje = reuniones.length > 0 ? Math.round((presentes / reuniones.length) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="PARTICIPACIÓN"
        title="Mis reuniones"
        subtitle="Historial de reuniones de la cooperativa y tu asistencia registrada."
      />

      {isError ? (
        <div className="inline-alert" role="alert">
          <XCircle size={15} />
          <span>{getApiErrorMessage(error, 'No se pudo cargar tu historial de reuniones.')}</span>
        </div>
      ) : null}

      {!isLoading ? (
        <div className="asistencia-summary">
          <span className="asistencia-chip green">
            <CheckCircle2 size={14} /> {presentes} asistencias
          </span>
          <span className="asistencia-chip red">
            <XCircle size={14} /> {reuniones.length - presentes} ausencias
          </span>
          <span className="asistencia-chip">
            <CalendarDays size={14} /> {reuniones.length} reuniones
          </span>
          <span className="asistencia-pct">{porcentaje}% asistencia</span>
        </div>
      ) : null}

      {isLoading ? <p className="table-note">Cargando reuniones…</p> : null}

      {!isLoading && reuniones.length === 0 ? (
        <div className="panel table-panel">
          <EmptyState
            icon={CalendarDays}
            title="Sin reuniones registradas"
            description="Cuando el administrador registre una reunión aparecerá aquí con tu asistencia."
          />
        </div>
      ) : null}

      <div className="reuniones-grid">
        {reuniones.map((reunion) => (
          <article key={reunion.id} className="reunion-card">
            <div className="reunion-head">
              <span className="reunion-fecha">
                <CalendarDays size={13} /> {formatFechaLarga(reunion.fecha)}
              </span>
              <EstadoBadge estado={reunion.asistencia} />
            </div>

            <strong>{reunion.titulo}</strong>
            {reunion.descripcion ? <span>{reunion.descripcion}</span> : null}

            {reunion.eleccionTitulo ? (
              <div className="reunion-eleccion">
                <Vote size={14} />
                <span>
                  {reunion.eleccionTitulo} <em>({reunion.eleccionEstado})</em>
                </span>
                {reunion.eleccionEstado === 'ACTIVE' && !reunion.yaVoto ? (
                  <Link to={`/votaciones/${reunion.eleccionId}`} className="reunion-vote-link">
                    Votar ahora
                  </Link>
                ) : reunion.yaVoto ? (
                  <Badge tone="green">Ya votaste</Badge>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}

/** Administración: historial de reuniones con su asistencia. */
function AdminReuniones() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useReuniones(page);
  const { eliminar } = useReunionMutations();

  const [crearOpen, setCrearOpen] = useState(false);
  const [seleccionada, setSeleccionada] = useState<Reunion | null>(null);
  const [toDelete, setToDelete] = useState<Reunion | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reuniones = data?.data ?? [];
  const meta = data?.meta;

  async function handleDelete() {
    if (!toDelete) return;
    setActionError(null);

    try {
      await eliminar.mutateAsync(toDelete.id);
      setToDelete(null);
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'No se pudo eliminar la reunión.'));
    }
  }

  if (seleccionada) {
    return (
      <>
        <button type="button" className="back-link" onClick={() => setSeleccionada(null)}>
          <ArrowLeft size={14} /> Volver a reuniones
        </button>

        <PageHeader
          eyebrow="REUNIÓN"
          title={seleccionada.titulo}
          subtitle={formatFechaLarga(seleccionada.fecha)}
          action={<span className="count-pill">{seleccionada.presentes}/{seleccionada.totalSocios}</span>}
        />

        {seleccionada.descripcion ? <p className="confirm-hint">{seleccionada.descripcion}</p> : null}

        {seleccionada.eleccionTitulo ? (
          <div className="reunion-eleccion wide">
            <Vote size={14} />
            <span>
              Elección vinculada: {seleccionada.eleccionTitulo} <em>({seleccionada.eleccionEstado})</em>
            </span>
            <Link to={`/votaciones/${seleccionada.eleccionId}`} className="reunion-vote-link">
              Abrir elección
            </Link>
          </div>
        ) : null}

        <div className="panel table-panel">
          <ReunionAsistencia reunionId={seleccionada.id} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="PARTICIPACIÓN"
        title="Reuniones"
        subtitle="Registra reuniones, marca la asistencia de los socios y vincula una elección."
        action={
          <button className="primary-button" onClick={() => setCrearOpen(true)}>
            <Plus size={17} /> Nueva reunión
          </button>
        }
      />

      {isError || actionError ? (
        <div className="inline-alert" role="alert">
          <XCircle size={15} />
          <span>{actionError ?? getApiErrorMessage(error, 'No se pudieron cargar las reuniones.')}</span>
        </div>
      ) : null}

      {isLoading ? <p className="table-note">Cargando reuniones…</p> : null}

      {!isLoading && reuniones.length === 0 ? (
        <div className="panel table-panel">
          <EmptyState
            icon={CalendarDays}
            title="Todavía no hay reuniones"
            description="Crea la primera reunión con el botón «Nueva reunión»."
          />
        </div>
      ) : null}

      <div className="reuniones-grid">
        {reuniones.map((reunion) => (
          <article key={reunion.id} className="reunion-card">
            <div className="reunion-head">
              <span className="reunion-fecha">
                <CalendarDays size={13} /> {formatFechaLarga(reunion.fecha)}
              </span>
              <span className="reunion-pct">{porcentajeAsistencia(reunion)}%</span>
            </div>

            <strong>{reunion.titulo}</strong>
            {reunion.descripcion ? <span>{reunion.descripcion}</span> : null}

            <div className="reunion-progress">
              <span style={{ width: `${porcentajeAsistencia(reunion)}%` }} />
            </div>

            <div className="reunion-foot">
              <span className="reunion-count">
                <UsersRound size={13} /> {reunion.presentes}/{reunion.totalSocios} presentes
              </span>
              <div className="reunion-actions">
                <Button size="sm" onClick={() => setSeleccionada(reunion)}>
                  Marcar asistencia
                </Button>
                <button
                  type="button"
                  className="icon-action icon-action-danger"
                  title="Eliminar"
                  aria-label={`Eliminar ${reunion.titulo}`}
                  onClick={() => setToDelete(reunion)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {reunion.eleccionTitulo ? (
              <div className="reunion-eleccion">
                <Vote size={13} />
                <span>
                  {reunion.eleccionTitulo} <em>({reunion.eleccionEstado})</em>
                </span>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {meta && meta.totalPages > 1 ? (
        <div className="pagination">
          <Button variant="ghost" size="sm" disabled={meta.page <= 1} onClick={() => setPage(meta.page - 1)}>
            Anterior
          </Button>
          <span>
            Página {meta.page} de {meta.totalPages}
          </span>
          <Button variant="ghost" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setPage(meta.page + 1)}>
            Siguiente
          </Button>
        </div>
      ) : null}

      <ReunionFormModal open={crearOpen} onClose={() => setCrearOpen(false)} />

      <Modal
        open={Boolean(toDelete)}
        title="Eliminar reunión"
        onClose={() => setToDelete(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)} disabled={eliminar.isPending}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={eliminar.isPending}>
              {eliminar.isPending ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </>
        }
      >
        <p className="confirm-text">
          ¿Eliminar <strong>{toDelete?.titulo}</strong>?
        </p>
        <p className="confirm-hint">Se borrará también la asistencia registrada de esa reunión.</p>
      </Modal>
    </>
  );
}

export function ReunionesPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('ADMIN') ?? false;

  return isAdmin ? <AdminReuniones /> : <MisReuniones />;
}

export const ReunionesIcon = MinusCircle;
