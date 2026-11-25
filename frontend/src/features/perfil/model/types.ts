import type { Socio } from '@features/socios';
import type { Unidad } from '@features/unidades';

export type MiPerfil = {
  socio: Socio;
  unidades: Unidad[];
};
