import { useState } from 'react';
import { Plus, ShieldAlert, UsersRound } from 'lucide-react';
import { Button } from '@components/Button';
import { EmptyState } from '@components/EmptyState';
import { Modal } from '@components/Modal';
import { PageHeader } from '@components/PageHeader';
import { useAuth } from '@features/auth';
import { getApiErrorMessage } from '@shared/api/errors';
import { useDebounce } from '@shared/hooks/useDebounce';
import { EMPTY_SOCIO_FILTERS } from '../model/types';
import type { Socio, SocioFilters, SocioFormValues } from '../model/types';
import { SocioFormModal } from '../components/SocioFormModal';
import { SociosFilters } from '../components/SociosFilters';
import { SociosTable } from '../components/SociosTable';
import { useSocioMutations, useSocios } from '../hooks/useSocios';

export function SociosPage() {
  const { user } = useAuth();
  const canManage = user?.roles.includes('ADMIN') ?? false;

  const [filters, setFilters] = useState<SocioFilters>(EMPTY_SOCIO_FILTERS);
  const debouncedQ = useDebounce(filters.q, 350);
  const { data, isLoading, isError, error, refetch } = useSocios({ ...filters, q: debouncedQ });

  const { create, update, changeEstado, retire } = useSocioMutations();

  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; socio?: Socio } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toRetire, setToRetire] = useState<Socio | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const socios = data?.data ?? [];
  const meta = data?.meta;
  const isSaving = create.isPending || update.isPending;

  function updateFilters(partial: Partial<SocioFilters>) {
    setFilters((current) => ({ ...current, ...partial }));
  }

  async function handleSubmit(values: SocioFormValues) {
    setFormError(null);

    try {
      if (modal?.mode === 'edit' && modal.socio) {
        await update.mutateAsync({
          id: modal.socio.id,
          input: {
            cedulaRuc: values.cedulaRuc,
            nombres: values.nombres,
            apellidos: values.apellidos,
            telefono: values.telefono,
          },
        });
      } else {
        await create.mutateAsync({
          cedulaRuc: values.cedulaRuc,
          nombres: values.nombres,
          apellidos: values.apellidos,
          telefono: values.telefono,
          email: values.email,
          password: values.password,
        });
      }
      setModal(null);
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'No se pudo guardar el socio.'));
    }
  }

  async function handleToggleEstado(socio: Socio) {
    setActionError(null);
    try {
      await changeEstado.mutateAsync({
        id: socio.id,
        estado: socio.estado === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO',
      });
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo cambiar el estado del socio.'));
    }
  }

  async function handleRetire() {
    if (!toRetire) return;
    setActionError(null);
    try {
      await retire.mutateAsync(toRetire.id);
      setToRetire(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo retirar al socio.'));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="GESTIÓN"
        title="Socios"
        subtitle="Administra los socios de la cooperativa y sus accesos al sistema."
        action={
          canManage ? (
            <button className="primary-button" onClick={() => { setFormError(null); setModal({ mode: 'create' }); }}>
              <Plus size={17} /> Nuevo socio
            </button>
          ) : undefined
        }
      />

      <div className="panel table-panel">
        <SociosFilters filters={filters} total={meta?.total ?? 0} onChange={updateFilters} />

        {!canManage ? (
          <p className="table-note">Modo lectura: solo un administrador puede crear o modificar socios.</p>
        ) : null}

        {isError || actionError ? (
          <div className="inline-alert" role="alert">
            <ShieldAlert size={15} />
            <span>{actionError ?? getApiErrorMessage(error, 'No se pudo cargar el listado de socios.')}</span>
            {isError ? (
              <button type="button" onClick={() => refetch()}>
                Reintentar
              </button>
            ) : null}
          </div>
        ) : null}

        {isLoading ? (
          <EmptyState icon={UsersRound} title="Cargando socios…" description="Consultando el listado" />
        ) : (
          <SociosTable
            socios={socios}
            canManage={canManage}
            onEdit={(socio) => { setFormError(null); setModal({ mode: 'edit', socio }); }}
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

      <SocioFormModal
        open={Boolean(modal)}
        mode={modal?.mode ?? 'create'}
        socio={modal?.socio ?? null}
        isSaving={isSaving}
        serverError={formError}
        onClose={() => { if (!isSaving) { setModal(null); setFormError(null); } }}
        onSubmit={handleSubmit}
      />

      <Modal
        open={Boolean(toRetire)}
        title="Retirar socio"
        onClose={() => { if (!retire.isPending) setToRetire(null); }}
        footer={
          <>
            <Button variant="ghost" onClick={() => setToRetire(null)} disabled={retire.isPending}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleRetire} disabled={retire.isPending}>
              {retire.isPending ? 'Retirando…' : 'Retirar'}
            </Button>
          </>
        }
      >
        <p className="confirm-text">
          ¿Seguro que quieres retirar a{' '}
          <strong>{toRetire ? `${toRetire.nombres} ${toRetire.apellidos}` : ''}</strong>?
        </p>
        <p className="confirm-hint">
          El socio pasará a estado <strong>RETIRADO</strong> y conservará su historial y sus unidades.
        </p>
      </Modal>
    </>
  );
}
