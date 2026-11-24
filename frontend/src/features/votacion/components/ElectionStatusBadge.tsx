import { Badge } from '@components/Badge';
import type { ElectionStatus } from '../model/types';

const tones: Record<ElectionStatus, 'gray' | 'green' | 'blue'> = {
  DRAFT: 'gray',
  ACTIVE: 'green',
  CLOSED: 'blue',
};

const labels: Record<ElectionStatus, string> = {
  DRAFT: 'BORRADOR',
  ACTIVE: 'ACTIVA',
  CLOSED: 'CERRADA',
};

export function ElectionStatusBadge({ status }: { status: ElectionStatus }) {
  return <Badge tone={tones[status]}>{labels[status]}</Badge>;
}
