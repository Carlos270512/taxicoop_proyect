export class Socio {
  constructor(
    public readonly id: string,
    public readonly cedulaRuc: string,
    public readonly nombres: string,
    public readonly apellidos: string,
    public readonly telefono: string,
    public readonly estado: 'ACTIVO' | 'SUSPENDIDO' | 'RETIRADO'
  ) {}
}