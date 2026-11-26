import { useState } from 'react';
import { Plus, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/Button';
import { PageHeader } from '@components/PageHeader';
import { useAuth } from '@features/auth';
import { AsistenciaPanel } from '@features/asistencia';
import { getApiErrorMessage } from '@shared/api/errors';
import { EMPTY_ELECTION_FILTERS } from '../model/types';
import type { ElectionFilters, ElectionFormValues, ElectionStatus } from '../model/types';
import { ElectionFormModal } from '../components/ElectionFormModal';
import { ElectionsTable } from '../components/ElectionsTable';
import { useElections, useVotacionMutations } from '../hooks/useVotaciones';

const TABS: Array<{ label: string; status: ElectionStatus | '' }> = [
  { label: 'Todas', status: '' },
  { label: 'Activas', status: 'ACTIVE' },
  { label: 'Borradores', status: 'DRAFT' },
  { label: 'Cerradas', status: 'CLOSED' },
];

export function VotacionesPage() {
  const { user } = useAuth();
  const canManage = user?.roles.includes('ADMIN') ?? false;
  const navigate = useNavigate();

  const [seccion, setSeccion] = useState<'elecciones' | 'asistencia'>('elecciones');
  const [filters, setFilters] = useState<ElectionFilters>(EMPTY_ELECTION_FILTERS);
  const { data, isLoading, isError, error, refetch } = useElections(filters);

  const { create } = useVotacionMutations();
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const elections = data?.data ?? [];
  const meta = data?.meta;

  function changeTab(status: ElectionStatus | '') {
    setFilters((current) => ({ ...current, status, page: 1 }));
  }

  async function handleCreate(values: ElectionFormValues) {
    setFormError(null);

    try {
      await create.mutateAsync({
        title: values.title.trim(),
        description: values.description.trim(),
        startDate: new Date(`${values.startDate}T00:00:00`).toISOString(),
        endDate: new Date(`${values.endDate}T23:59:59`).toISOString(),
        options: values.options
          .map((option) => option.trim())
          .filter(Boolean)
          .map((title) => ({ title })),
      });
      setModalOpen(false);
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'No se pudo crear la elección.'));
    }
  }

  const emptyCopy =
    filters.status === 'ACTIVE'
      ? { title: 'No hay elecciones activas', description: 'Cuando una elección se active aparecerá aquí.' }
      : { title: 'Todavía no hay elecciones', description: 'Crea la primera elección con el botón «Nueva elección».' };

  return (
    <>
      <PageHeader
        eyebrow="PARTICIPACIÓN"
        title="Votaciones"
        subtitle="Elecciones de la cooperativa: crea, vota y consulta resultados."
        action={
          canManage ? (
            <button className="primary-button" onClick={() => { setFormError(null); setModalOpen(true); }}>
              <Plus size={17} /> Nueva elección
            </button>
          ) : undefined
        }
      />

      <div className="panel table-panel">
        {canManage ? (
          <div className="tabs" role="tablist" aria-label="Secciones de votaciones">
            <button
              type="button"
              role="tab"
              aria-selected={seccion === 'elecciones'}
              className={`tab${seccion === 'elecciones' ? ' active' : ''}`}
              onClick={() => setSeccion('elecciones')}
            >
              Elecciones
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={seccion === 'asistencia'}
              className={`tab${seccion === 'asistencia' ? ' active' : ''}`}
              onClick={() => setSeccion('asistencia')}
            >
              Asistencia
            </button>
          </div>
        ) : null}

        {seccion === 'asistencia' && canManage ? (
          <AsistenciaPanel />
        ) : (
          <>
        <div className="tabs" role="tablist" aria-label="Filtrar elecciones">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={filters.status === tab.status}
              className={`tab${filters.status === tab.status ? ' active' : ''}`}
              onClick={() => changeTab(tab.status)}
            >
              {tab.label}
            </button>
          ))}
          <span className="table-count">
            {meta?.total ?? 0} {(meta?.total ?? 0) === 1 ? 'elección' : 'elecciones'}
          </span>
        </div>

        {isError ? (
          <div className="inline-alert" role="alert">
            <ShieldAlert size={15} />
            <span>{getApiErrorMessage(error, 'No se pudo cargar el listado de elecciones.')}</span>
            <button type="button" onClick={() => refetch()}>Reintentar</button>
          </div>
        ) : null}

        {isLoading ? (
          <p className="table-note">Cargando elecciones…</p>
        ) : (
          <ElectionsTable
            elections={elections}
            onOpen={(election) => navigate(`/votaciones/${election.id}`)}
            emptyTitle={emptyCopy.title}
            emptyDescription={emptyCopy.description}
          />
        )}

        {meta && meta.totalPages > 1 ? (
          <div className="pagination">
            <Button variant="ghost" size="sm" disabled={meta.page <= 1} onClick={() => setFilters((c) => ({ ...c, page: meta.page - 1 }))}>
              Anterior
            </Button>
            <span>
              Página {meta.page} de {meta.totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setFilters((c) => ({ ...c, page: meta.page + 1 }))}
            >
              Siguiente
            </Button>
          </div>
        ) : null}
          </>
        )}
      </div>

      <ElectionFormModal
        open={modalOpen}
        isSaving={create.isPending}
        serverError={formError}
        onClose={() => { if (!create.isPending) { setModalOpen(false); setFormError(null); } }}
        onSubmit={handleCreate}
      />
    </>
  );
}
