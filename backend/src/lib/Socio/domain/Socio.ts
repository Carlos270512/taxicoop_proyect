export type SocioEstado = 'ACTIVO' | 'SUSPENDIDO' | 'RETIRADO';

export const SOCIO_ESTADOS: SocioEstado[] = ['ACTIVO', 'SUSPENDIDO', 'RETIRADO'];

export class Socio {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly cedulaRuc: string,
    public readonly nombres: string,
    public readonly apellidos: string,
    public readonly telefono: string,
    public readonly estado: SocioEstado,
    public readonly email?: string,
    public readonly unidadesCount?: number,
    public readonly createdAt?: Date,
    public readonly direccion?: string | null,
    public readonly socioSalienteId?: string | null,
    public readonly solicitudId?: string | null
  ) {}
}