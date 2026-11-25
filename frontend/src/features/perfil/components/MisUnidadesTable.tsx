import { CarFront } from 'lucide-react';
import { EmptyState } from '@components/EmptyState';
import { Table } from '@components/Table';
import type { Column } from '@components/Table';
import { UnidadStatusBadge } from '@features/unidades';
import type { Unidad } from '@features/unidades';

const columns: Column<Unidad>[] = [
  {
    key: 'numeroUnidad',
    header: 'Unidad',
    render: (unidad) => (
      <div className="cell-main">
        <strong>{unidad.numeroUnidad}</strong>
        <span>Año {unidad.anioVehiculo}</span>
      </div>
    ),
  },
  { key: 'placa', header: 'Placa', render: (unidad) => unidad.placa },
  { key: 'estado', header: 'Estado', render: (unidad) => <UnidadStatusBadge estado={unidad.estado} /> },
];

export function MisUnidadesTable({ unidades }: { unidades: Unidad[] }) {
  return (
    <Table
      columns={columns}
      rows={unidades}
      getRowKey={(unidad) => unidad.id}
      empty={
        <EmptyState
          icon={CarFront}
          title="Sin unidades registradas"
          description="Cuando el administrador registre un vehículo a tu nombre aparecerá aquí."
        />
      }
    />
  );
}
