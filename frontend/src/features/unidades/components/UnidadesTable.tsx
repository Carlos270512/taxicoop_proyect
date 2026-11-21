import { CarFront, Pencil, RotateCcw, ShieldOff, Trash2 } from 'lucide-react';
import { EmptyState } from '@components/EmptyState';
import { Table } from '@components/Table';
import type { Column } from '@components/Table';
import type { Unidad } from '../model/types';
import { UnidadStatusBadge } from './UnidadStatusBadge';

type UnidadesTableProps = {
  unidades: Unidad[];
  canManage: boolean;
  onEdit: (unidad: Unidad) => void;
  onToggleEstado: (unidad: Unidad) => void;
  onRetire: (unidad: Unidad) => void;
};

export function UnidadesTable({ unidades, canManage, onEdit, onToggleEstado, onRetire }: UnidadesTableProps) {
  const columns: Column<Unidad>[] = [
    {
      key: 'unidad',
      header: 'Unidad',
      render: (unidad) => <strong className="cell-strong">{unidad.numeroUnidad}</strong>,
    },
    {
      key: 'placa',
      header: 'Placa',
      render: (unidad) => <span className="cell-mono">{unidad.placa}</span>,
    },
    {
      key: 'socio',
      header: 'Socio',
      render: (unidad) => unidad.socioNombre ?? '—',
    },
    { key: 'anio', header: 'Año', render: (unidad) => unidad.anioVehiculo },
    { key: 'estado', header: 'Estado', render: (unidad) => <UnidadStatusBadge estado={unidad.estado} /> },
  ];

  if (canManage) {
    columns.push({
      key: 'acciones',
      header: 'Acciones',
      className: 'cell-actions',
      render: (unidad) => (
        <div className="row-actions">
          <button
            type="button"
            className="icon-action"
            title="Editar"
            aria-label={`Editar la unidad ${unidad.numeroUnidad}`}
            onClick={() => onEdit(unidad)}
          >
            <Pencil size={15} />
          </button>

          {unidad.estado === 'SUSPENDIDA' ? (
            <button
              type="button"
              className="icon-action"
              title="Activar"
              aria-label={`Activar la unidad ${unidad.numeroUnidad}`}
              onClick={() => onToggleEstado(unidad)}
            >
              <RotateCcw size={15} />
            </button>
          ) : (
            <button
              type="button"
              className="icon-action"
              title="Suspender"
              aria-label={`Suspender la unidad ${unidad.numeroUnidad}`}
              onClick={() => onToggleEstado(unidad)}
            >
              <ShieldOff size={15} />
            </button>
          )}

          {unidad.estado !== 'SUSPENDIDA' ? (
            <button
              type="button"
              className="icon-action icon-action-danger"
              title="Dar de baja"
              aria-label={`Dar de baja la unidad ${unidad.numeroUnidad}`}
              onClick={() => onRetire(unidad)}
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
      rows={unidades}
      getRowKey={(unidad) => unidad.id}
      empty={
        <EmptyState
          icon={CarFront}
          title="Todavía no hay unidades"
          description="Registra el primer vehículo con el botón «Nueva unidad»."
        />
      }
    />
  );
}
