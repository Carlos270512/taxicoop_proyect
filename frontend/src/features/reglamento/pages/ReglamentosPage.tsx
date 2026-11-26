import { useState } from 'react';
import { BookOpen, Download, FileText, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { Button } from '@components/Button';
import { EmptyState } from '@components/EmptyState';
import { Modal } from '@components/Modal';
import { PageHeader } from '@components/PageHeader';
import { useAuth } from '@features/auth';
import { getApiErrorMessage } from '@shared/api/errors';
import { ReglamentoFormModal } from '../components/ReglamentoFormModal';
import { useReglamentoMutations, useReglamentos } from '../hooks/useReglamentos';
import { abrirReglamento } from '../api/reglamento.api';
import { formatFecha, formatTamano } from '../model/types';
import type { Reglamento } from '../model/types';

export function ReglamentosPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('ADMIN') ?? false;

  const { data, isLoading, isError, error, refetch } = useReglamentos();
  const { eliminar } = useReglamentoMutations();

  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Reglamento | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reglamentos = data ?? [];

  async function handleDelete() {
    if (!toDelete) return;
    setActionError(null);

    try {
      await eliminar.mutateAsync(toDelete.id);
      setToDelete(null);
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'No se pudo eliminar el reglamento.'));
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="DOCUMENTOS"
        title="Reglamento"
        subtitle={
          isAdmin
            ? 'Publica los reglamentos de la cooperativa en PDF. Los socios pueden consultarlos.'
            : 'Consulta los reglamentos vigentes de la cooperativa.'
        }
        action={
          isAdmin ? (
            <button className="primary-button" onClick={() => setModalOpen(true)}>
              <Plus size={17} /> Subir reglamento
            </button>
          ) : undefined
        }
      />

      {isError || actionError ? (
        <div className="inline-alert" role="alert">
          <ShieldAlert size={15} />
          <span>{actionError ?? getApiErrorMessage(error, 'No se pudieron cargar los reglamentos.')}</span>
          {isError ? (
            <button type="button" onClick={() => refetch()}>
              Reintentar
            </button>
          ) : null}
        </div>
      ) : null}

      {isLoading ? (
        <p className="table-note">Cargando reglamentos…</p>
      ) : reglamentos.length === 0 ? (
        <div className="panel table-panel">
          <EmptyState
            icon={BookOpen}
            title="Todavía no hay reglamentos"
            description={
              isAdmin
                ? 'Sube el primer PDF con el botón «Subir reglamento».'
                : 'Cuando el administrador publique un reglamento aparecerá aquí.'
            }
          />
        </div>
      ) : (
        <div className="reglamento-grid">
          {reglamentos.map((reglamento) => (
            <article key={reglamento.id} className="reglamento-card">
              <div className="reglamento-icon">
                <FileText size={20} />
              </div>

              <div className="reglamento-copy">
                <strong>{reglamento.titulo}</strong>
                {reglamento.descripcion ? <span>{reglamento.descripcion}</span> : null}
                <em>
                  {reglamento.nombreOriginal} · {formatTamano(reglamento.tamano)} · {formatFecha(reglamento.createdAt)}
                </em>
              </div>

              <div className="reglamento-actions">
                <Button size="sm" onClick={() => void abrirReglamento(reglamento.id)}>
                  <Download size={14} /> Ver PDF
                </Button>
                {isAdmin ? (
                  <button
                    type="button"
                    className="icon-action icon-action-danger"
                    title="Eliminar"
                    aria-label={`Eliminar ${reglamento.titulo}`}
                    onClick={() => setToDelete(reglamento)}
                  >
                    <Trash2 size={15} />
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <ReglamentoFormModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <Modal
        open={Boolean(toDelete)}
        title="Eliminar reglamento"
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
        <p className="confirm-hint">Los socios dejarán de ver este documento.</p>
      </Modal>
    </>
  );
}
