import { Pencil, RotateCcw, ShieldOff, Trash2, UsersRound } from 'lucide-react';
import { EmptyState } from '@components/EmptyState';
import { Table } from '@components/Table';
import type { Column } from '@components/Table';
import type { Socio } from '../model/types';
import { SocioStatusBadge } from './SocioStatusBadge';

type SociosTableProps = {
  socios: Socio[];
  canManage: boolean;
  onEdit: (socio: Socio) => void;
  onToggleEstado: (socio: Socio) => void;
  onRetire: (socio: Socio) => void;
};

export function SociosTable({ socios, canManage, onEdit, onToggleEstado, onRetire }: SociosTableProps) {
  const columns: Column<Socio>[] = [
    {
      key: 'socio',
      header: 'Socio',
      render: (socio) => (
        <div className="cell-main">
          <strong>
            {socio.nombres} {socio.apellidos}
          </strong>
          <span>{socio.email ?? '—'}</span>
        </div>
      ),
    },
    {
      key: 'cedula',
      header: 'Cédula / RUC',
      render: (socio) => <span className="cell-mono">{socio.cedulaRuc}</span>,
    },
    { key: 'telefono', header: 'Teléfono', render: (socio) => socio.telefono },
    { key: 'unidades', header: 'Unidades', render: (socio) => socio.unidadesCount ?? 0 },
    { key: 'estado', header: 'Estado', render: (socio) => <SocioStatusBadge estado={socio.estado} /> },
  ];

  if (canManage) {
    columns.push({
      key: 'acciones',
      header: 'Acciones',
      className: 'cell-actions',
      render: (socio) => (
        <div className="row-actions">
          <button
            type="button"
            className="icon-action"
            title="Editar"
            aria-label={`Editar a ${socio.nombres} ${socio.apellidos}`}
            onClick={() => onEdit(socio)}
          >
            <Pencil size={15} />
          </button>

          {socio.estado === 'ACTIVO' ? (
            <button
              type="button"
              className="icon-action"
              title="Suspender"
              aria-label={`Suspender a ${socio.nombres} ${socio.apellidos}`}
              onClick={() => onToggleEstado(socio)}
            >
              <ShieldOff size={15} />
            </button>
          ) : (
            <button
              type="button"
              className="icon-action"
              title="Activar"
              aria-label={`Activar a ${socio.nombres} ${socio.apellidos}`}
              onClick={() => onToggleEstado(socio)}
            >
              <RotateCcw size={15} />
            </button>
          )}

          {socio.estado !== 'RETIRADO' ? (
            <button
              type="button"
              className="icon-action icon-action-danger"
              title="Retirar"
              aria-label={`Retirar a ${socio.nombres} ${socio.apellidos}`}
              onClick={() => onRetire(socio)}
            >
              <Trash2 size={15} />
            </button>
          ) : null}
        </div>
      ),
    });
  }

  return (
    <Table
      columns={columns}
      rows={socios}
      getRowKey={(socio) => socio.id}
      empty={
        <EmptyState
          icon={UsersRound}
          title="Todavía no hay socios"
          description="Registra el primer socio con el botón «Nuevo socio»."
        />
      }
    />
  );
}
