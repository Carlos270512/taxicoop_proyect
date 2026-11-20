export class EmergencyAlert {
  constructor(
    public readonly id: string,
    public readonly socioId: string,
    public readonly numeroUnidad: string,
    public readonly ubicacion: {
      latitud: number;
      longitud: number;
    },
    public readonly estado: 'PENDIENTE' | 'EN_ATENCION' | 'RESUELTA',
    public readonly createdAt?: Date
  ) {}
}