import { Badge } from '@components/Badge';
import type { UnidadEstado } from '../model/types';

const tones: Record<UnidadEstado, 'green' | 'orange' | 'gray'> = {
  OPERATIVA: 'green',
  EN_TRAMITE: 'orange',
  SUSPENDIDA: 'gray',
};

export function UnidadStatusBadge({ estado }: { estado: UnidadEstado }) {
  return <Badge tone={tones[estado]}>{estado}</Badge>;
}
