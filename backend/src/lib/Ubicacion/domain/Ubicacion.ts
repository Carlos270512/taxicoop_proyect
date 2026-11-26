export type Ubicacion = {
  id: string;
  socioId: string;
  latitud: number;
  longitud: number;
  precisionMetros: number | null;
  capturedAt: Date;
};

export type NuevaUbicacion = {
  socioId: string;
  latitud: number;
  longitud: number;
  precisionMetros?: number | null;
  capturedAt: Date;
};
