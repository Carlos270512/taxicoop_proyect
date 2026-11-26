import { useState } from 'react';
import { CheckCircle2, FileText, Link2, Paperclip, ShieldAlert, XCircle } from 'lucide-react';
import { Badge } from '@components/Badge';
import { Button } from '@components/Button';
import { EmptyState } from '@components/EmptyState';
import { Modal } from '@components/Modal';
import { Table } from '@components/Table';
import type { Column } from '@components/Table';
import { getApiErrorMessage } from '@shared/api/errors';
import { abrirArchivo } from '../api/solicitudes.api';
import { useSolicitudMutations, useSolicitudes } from '../hooks/useSolicitudes';
import { ARCHIVO_LABELS } from '../model/types';
import type { Solicitud, SolicitudEstado } from '../model/types';

const TONES: Record<SolicitudEstado, 'orange' | 'green' | 'red'> = {
  PENDIENTE: 'orange',
  APROBADA: 'green',
  RECHAZADA: 'red',
};

const TABS: Array<{ label: string; estado: string }> = [
  { label: 'Todas', estado: '' },
  { label: 'Pendientes', estado: 'PENDIENTE' },
  { label: 'Aprobadas', estado: 'APROBADA' },
  { label: 'Rechazadas', estado: 'RECHAZADA' },
];

function formatFecha(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function SolicitudesPanel() {
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useSolicitudes(estado, page);

  const [detalle, setDetalle] = useState<Solicitud | null>(null);
  const [motivo, setMotivo] = useState('');
  const [rechazando, setRechazando] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { approve, reject } = useSolicitudMutations();

  const solicitudes = data?.data ?? [];
  const meta = data?.meta;

  async function handleApprove(solicitud: Solicitud) {
    setActionError(null);
    try {
      await approve.mutateAsync(solicitud.id);
      setDetalle(null);
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'No se pudo aprobar la postulación.'));
    }
  }

  async function handleReject(solicitud: Solicitud) {
    setActionError(null);
    try {
      await reject.mutateAsync({ id: solicitud.id, motivo });
      setDetalle(null);
      setRechazando(false);
      setMotivo('');
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'No se pudo rechazar la postulación.'));
    }
  }

  const columns: Column<Solicitud>[] = [
    {
      key: 'postulante',
      header: 'Postulante',
      render: (solicitud) => (
        <div className="cell-main">
          <strong>
            {solicitud.data.nombres ?? 'Sin datos'} {solicitud.data.apellidos ?? ''}
          </strong>
          <span>{solicitud.data.cedulaRuc ?? 'Formulario sin completar'}</span>
        </div>
      ),
    },
    {
      key: 'contacto',
      header: 'Contacto',
      render: (solicitud) => (
        <div className="cell-main">
          <strong>{solicitud.data.telefono ?? '—'}</strong>
          <span>{solicitud.data.email ?? '—'}</span>
        </div>
      ),
    },
    {
      key: 'vehiculo',
      header: 'Vehículo',
      render: (solicitud) =>
        solicitud.data.placa ? (
          <div className="cell-main">
            <strong>{solicitud.data.placa}</strong>
            <span>{solicitud.data.numeroUnidad ?? ''}</span>
          </div>
        ) : (
          '—'
        ),
    },
    {
      key: 'archivos',
      header: 'Docs',
      render: (solicitud) => (
        <span className="cell-mono">
          <Paperclip size={12} /> {solicitud.archivos.length}/3
        </span>
      ),
    },
    {
      key: 'saliente',
      header: 'Socio saliente',
      render: (solicitud) => solicitud.socioSalienteNombre ?? '—',
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (solicitud) => <Badge tone={TONES[solicitud.estado]}>{solicitud.estado}</Badge>,
    },
    {
      key: 'fecha',
      header: 'Enviada',
      render: (solicitud) => <span className="period">{formatFecha(solicitud.submittedAt ?? solicitud.createdAt)}</span>,
    },
    {
      key: 'acciones',
      header: '',
      className: 'cell-actions',
      render: (solicitud) => (
        <Button size="sm" variant="ghost" onClick={() => { setDetalle(solicitud); setActionError(null); setRechazando(false); }}>
          Revisar
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Filtrar postulaciones">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={estado === tab.estado}
            className={`tab${estado === tab.estado ? ' active' : ''}`}
            onClick={() => { setEstado(tab.estado); setPage(1); }}
          >
            {tab.label}
          </button>
        ))}
        <span className="table-count">{meta?.total ?? 0} postulaciones</span>
      </div>

      {isError ? (
        <div className="inline-alert" role="alert">
          <ShieldAlert size={15} />
          <span>{getApiErrorMessage(error, 'No se pudieron cargar las postulaciones.')}</span>
        </div>
      ) : null}

      {isLoading ? (
        <p className="table-note">Cargando postulaciones…</p>
      ) : (
        <Table
          columns={columns}
          rows={solicitudes}
          getRowKey={(solicitud) => solicitud.id}
          empty={
            <EmptyState
              icon={Link2}
              title="Sin postulaciones"
              description="Genera un enlace con el botón «Enlace de postulación» para que un aspirante llene sus datos."
            />
          }
        />
      )}

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

      <Modal
        open={Boolean(detalle)}
        title="Revisar postulación"
        onClose={() => { setDetalle(null); setRechazando(false); setMotivo(''); }}
        footer={
          detalle?.estado === 'PENDIENTE' && detalle.submittedAt ? (
            rechazando ? (
              <>
                <Button variant="ghost" onClick={() => setRechazando(false)} disabled={reject.isPending}>
                  Volver
                </Button>
                <Button variant="danger" onClick={() => handleReject(detalle)} disabled={reject.isPending || motivo.trim().length < 5}>
                  {reject.isPending ? 'Rechazando…' : 'Confirmar rechazo'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setRechazando(true)}>
                  <XCircle size={15} /> Rechazar
                </Button>
                <Button onClick={() => handleApprove(detalle)} disabled={approve.isPending}>
                  <CheckCircle2 size={15} /> {approve.isPending ? 'Aprobando…' : 'Aprobar socio'}
                </Button>
              </>
            )
          ) : (
            <Button onClick={() => setDetalle(null)}>Cerrar</Button>
          )
        }
      >
        {detalle ? (
          <>
            <div className="solicitud-head">
              <Badge tone={TONES[detalle.estado]}>{detalle.estado}</Badge>
              <span className="period">Creada {formatFecha(detalle.createdAt)}</span>
              {detalle.submittedAt ? <span className="period">Enviada {formatFecha(detalle.submittedAt)}</span> : null}
            </div>

            {!detalle.submittedAt ? (
              <div className="locked-note">
                <Link2 size={16} />
                <span>El postulante todavía no completa el formulario con este enlace.</span>
              </div>
            ) : null}

            {detalle.motivoRechazo ? (
              <p className="ubicacion-error" role="alert">
                Motivo del rechazo: {detalle.motivoRechazo}
              </p>
            ) : null}

            <div className="solicitud-grid">
              <div>
                <span className="solicitud-label">Postulante</span>
                <strong>
                  {detalle.data.nombres} {detalle.data.apellidos}
                </strong>
                <span>{detalle.data.cedulaRuc}</span>
              </div>
              <div>
                <span className="solicitud-label">Contacto</span>
                <strong>{detalle.data.telefono}</strong>
                <span>{detalle.data.email}</span>
              </div>
              <div>
                <span className="solicitud-label">Dirección</span>
                <strong>{detalle.data.direccion ?? '—'}</strong>
              </div>
              <div>
                <span className="solicitud-label">Vehículo</span>
                <strong>
                  {detalle.data.numeroUnidad} · {detalle.data.placa}
                </strong>
                <span>
                  Año {detalle.data.anioVehiculo}
                  {detalle.data.fechaExpiracion
                    ? ` · matrícula vence ${new Date(detalle.data.fechaExpiracion).getFullYear()}`
                    : ''}
                </span>
              </div>
              <div>
                <span className="solicitud-label">Socio saliente</span>
                <strong>{detalle.socioSalienteNombre ?? 'Puesto nuevo'}</strong>
              </div>
            </div>

            <div className="solicitud-docs">
              <span className="solicitud-label">Documentos</span>
              {detalle.archivos.length === 0 ? (
                <p className="confirm-hint">Sin documentos cargados.</p>
              ) : (
                detalle.archivos.map((archivo) => (
                  <button key={archivo.id} type="button" className="doc-row" onClick={() => void abrirArchivo(archivo.id)}>
                    <FileText size={15} />
                    <span>{ARCHIVO_LABELS[archivo.tipo]}</span>
                    <code>{archivo.tamano < 1024 ? `${archivo.tamano} B` : `${Math.round(archivo.tamano / 1024)} KB`}</code>
                  </button>
                ))
              )}
            </div>

            {rechazando ? (
              <div className="field">
                <label className="field-label" htmlFor="motivo">
                  Motivo del rechazo
                </label>
                <textarea
                  id="motivo"
                  className="field-input field-textarea"
                  rows={3}
                  value={motivo}
                  onChange={(event) => setMotivo(event.target.value)}
                  placeholder="Ej. Documentos ilegibles, volver a postular."
                />
              </div>
            ) : null}

            {actionError ? (
              <p className="form-error" role="alert">
                {actionError}
              </p>
            ) : null}
          </>
        ) : null}
      </Modal>
    </>
  );
}
