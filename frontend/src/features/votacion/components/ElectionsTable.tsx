import { ChevronRight, Vote } from 'lucide-react';
import { EmptyState } from '@components/EmptyState';
import { Table } from '@components/Table';
import type { Column } from '@components/Table';
import type { Election } from '../model/types';
import { formatPeriod } from '../model/format';
import { ElectionStatusBadge } from './ElectionStatusBadge';

type ElectionsTableProps = {
  elections: Election[];
  onOpen: (election: Election) => void;
  emptyTitle: string;
  emptyDescription: string;
};

export function ElectionsTable({ elections, onOpen, emptyTitle, emptyDescription }: ElectionsTableProps) {
  const columns: Column<Election>[] = [
    {
      key: 'election',
      header: 'Elección',
      render: (election) => (
        <div className="cell-main">
          <strong>{election.title}</strong>
          <span>{election.description || 'Sin descripción'}</span>
        </div>
      ),
    },
    { key: 'period', header: 'Periodo', render: (election) => <span className="period">{formatPeriod(election.startDate, election.endDate)}</span> },
    { key: 'options', header: 'Opciones', render: (election) => election.options.length },
    { key: 'votes', header: 'Votos', render: (election) => election.votesCount },
    { key: 'status', header: 'Estado', render: (election) => <ElectionStatusBadge status={election.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'cell-actions',
      render: (election) => (
        <button
          type="button"
          className="icon-action"
          title="Abrir"
          aria-label={`Abrir ${election.title}`}
          onClick={() => onOpen(election)}
        >
          <ChevronRight size={15} />
        </button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      rows={elections}
      getRowKey={(election) => election.id}
      empty={<EmptyState icon={Vote} title={emptyTitle} description={emptyDescription} />}
    />
  );
}
