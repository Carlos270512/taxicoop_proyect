export type UnidadEstado = 'OPERATIVA' | 'EN_TRAMITE' | 'SUSPENDIDA';

export const UNIDAD_ESTADOS: UnidadEstado[] = ['OPERATIVA', 'EN_TRAMITE', 'SUSPENDIDA'];

export class Unidad {
  constructor(
    public readonly id: string,
    public readonly numeroUnidad: string,
    public readonly placa: string,
    public readonly anioVehiculo: number,
    public readonly socioId: string,
    public readonly estado: UnidadEstado,
    public readonly socioNombre?: string,
    public readonly socioEstado?: string,
    public readonly createdAt?: Date,
    public readonly fechaExpiracion?: Date | null,
    public readonly matriculaArchivoId?: string | null
  ) {}
}