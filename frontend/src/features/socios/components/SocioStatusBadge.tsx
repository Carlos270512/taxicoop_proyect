import { Badge } from '@components/Badge';
import type { SocioEstado } from '../model/types';

const tones: Record<SocioEstado, 'green' | 'orange' | 'gray'> = {
  ACTIVO: 'green',
  SUSPENDIDO: 'orange',
  RETIRADO: 'gray',
};

export function SocioStatusBadge({ estado }: { estado: SocioEstado }) {
  return <Badge tone={tones[estado]}>{estado}</Badge>;
}
