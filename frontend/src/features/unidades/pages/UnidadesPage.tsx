import { useState } from 'react';
import { CarFront, Plus, ShieldAlert } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@components/Button';
import { EmptyState } from '@components/EmptyState';
import { Modal } from '@components/Modal';
import { PageHeader } from '@components/PageHeader';
import { useAuth } from '@features/auth';
import { useSocios } from '@features/socios';
import { getApiErrorMessage } from '@shared/api/errors';
import { useDebounce } from '@shared/hooks/useDebounce';
import { EMPTY_UNIDAD_FILTERS } from '../model/types';
import type { Unidad, UnidadFilters, UnidadFormValues } from '../model/types';
import { UnidadFormModal } from '../components/UnidadFormModal';
import { UnidadesFilters } from '../components/UnidadesFilters';
import { UnidadesTable } from '../components/UnidadesTable';
import { useUnidadMutations, useUnidades } from '../hooks/useUnidades';

export function UnidadesPage() {
  const { user } = useAuth();
  const canManage = user?.roles.includes('ADMIN') ?? false;

  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<UnidadFilters>({
    ...EMPTY_UNIDAD_FILTERS,
    socioId: searchParams.get('socioId') ?? '',
  });

  const debouncedQ = useDebounce(filters.q, 350);
  const { data, isLoading, isError, error, refetch } = useUnidades({ ...filters, q: debouncedQ });

  const sociosQuery = useSocios({ q: '', estado: 'ACTIVO', page: 1, limit: 100 });
  const socios = sociosQuery.data?.data ?? [];

  const { create, update, changeEstado, retire } = useUnidadMutations();

  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; unidad?: Unidad } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toRetire, setToRetire] = useState<Unidad | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const unidades = data?.data ?? [];
  const meta = data?.meta;
  const isSaving = create.isPending || update.isPending;

  const socioLabel =
    socios.find((socio) => socio.id === filters.socioId)?.nombres ?? unidades[0]?.socioNombre;

  function updateFilters(partial: Partial<UnidadFilters>) {
    setFilters((current) => ({ ...current, ...partial }));
  }

  function clearSocioFilter() {
    updateFilters({ socioId: '', page: 1 });
    const next = new URLSearchParams(searchParams);
    next.delete('socioId');
    setSearchParams(next, { replace: true });
  }

  async function handleSubmit(values: UnidadFormValues) {
    setFormError(null);
    const anioVehiculo = Number(values.anioVehiculo);

    try {
      if (modal?.mode === 'edit' && modal.unidad) {
        await update.mutateAsync({
          id: modal.unidad.id,
          input: {
            numeroUnidad: values.numeroUnidad,
            placa: values.placa,
            anioVehiculo,
            socioId: values.socioId,
          },
        });
      } else {
        await create.mutateAsync({
          numeroUnidad: values.numeroUnidad,
          placa: values.placa,
          anioVehiculo,
          socioId: values.socioId,
        });
      }
      setModal(null);
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'No se pudo guardar la unidad.'));
    }
  }

  async function handleToggleEstado(unidad: Unidad) {
    setActionError(null);
    try {
      await changeEstado.mutateAsync({
        id: unidad.id,
        estado: unidad.estado === 'SUSPENDIDA' ? 'OPERATIVA' : 'SUSPENDIDA',
      });
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo cambiar el estado de la unidad.'));
    }
  }

  async function handleRetire() {
    if (!toRetire) return;
    setActionError(null);
    try {
      await retire.mutateAsync(toRetire.id);
      setToRetire(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo dar de baja la unidad.'));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="GESTIÓN"
        title="Vehículos"
        subtitle="Unidades de la cooperativa y el socio dueño de cada una."
        action={
          canManage ? (
            <button className="primary-button" onClick={() => { setFormError(null); setModal({ mode: 'create' }); }}>
              <Plus size={17} /> Nueva unidad
            </button>
          ) : undefined
        }
      />

      <div className="panel table-panel">
        <UnidadesFilters
          filters={filters}
          total={meta?.total ?? 0}
          socioLabel={socioLabel}
          onChange={updateFilters}
          onClearSocio={clearSocioFilter}
        />

        {!canManage ? (
          <p className="table-note">Modo lectura: solo un administrador puede registrar o modificar unidades.</p>
        ) : null}

        {isError || actionError ? (
          <div className="inline-alert" role="alert">
            <ShieldAlert size={15} />
            <span>{actionError ?? getApiErrorMessage(error, 'No se pudo cargar el listado de unidades.')}</span>
            {isError ? (
              <button type="button" onClick={() => refetch()}>
                Reintentar
              </button>
            ) : null}
          </div>
        ) : null}

        {isLoading ? (
          <EmptyState icon={CarFront} title="Cargando unidades…" description="Consultando el listado" />
        ) : (
          <UnidadesTable
            unidades={unidades}
            canManage={canManage}
            onEdit={(unidad) => { setFormError(null); setModal({ mode: 'edit', unidad }); }}
            onToggleEstado={handleToggleEstado}
            onRetire={setToRetire}
          />
        )}

        {meta && meta.totalPages > 1 ? (
          <div className="pagination">
            <Button
              variant="ghost"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => updateFilters({ page: meta.page - 1 })}
            >
              Anterior
            </Button>
            <span>
              Página {meta.page} de {meta.totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => updateFilters({ page: meta.page + 1 })}
            >
              Siguiente
            </Button>
          </div>
        ) : null}
      </div>

      <UnidadFormModal
        open={Boolean(modal)}
        mode={modal?.mode ?? 'create'}
        unidad={modal?.unidad ?? null}
        socios={socios}
        lockedSocioId={filters.socioId || undefined}
        isSaving={isSaving}
        serverError={formError}
        onClose={() => { if (!isSaving) { setModal(null); setFormError(null); } }}
        onSubmit={handleSubmit}
      />

      <Modal
        open={Boolean(toRetire)}
        title="Dar de baja la unidad"
        onClose={() => { if (!retire.isPending) setToRetire(null); }}
        footer={
          <>
            <Button variant="ghost" onClick={() => setToRetire(null)} disabled={retire.isPending}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleRetire} disabled={retire.isPending}>
              {retire.isPending ? 'Procesando…' : 'Dar de baja'}
            </Button>
          </>
        }
      >
        <p className="confirm-text">
          ¿Dar de baja la unidad{' '}
          <strong>{toRetire ? `${toRetire.numeroUnidad} (${toRetire.placa})` : ''}</strong>?
        </p>
        <p className="confirm-hint">
          La unidad pasará a estado <strong>SUSPENDIDA</strong> y conservará su historial.
        </p>
      </Modal>
    </>
  );
}
