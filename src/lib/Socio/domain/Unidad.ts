export class Unidad {
  constructor(
    public readonly id: string,
    public readonly numeroUnidad: string,
    public readonly placa: string,
    public readonly anioVehiculo: number,
    public readonly socioId: string,
    public readonly estado: 'OPERATIVA' | 'EN_TRAMITE' | 'SUSPENDIDA'
  ) {}
}