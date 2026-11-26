export type Ubicacion = {
  id: string;
  socioId: string;
  latitud: number;
  longitud: number;
  precisionMetros: number | null;
  capturedAt: string;
};

export type SocioUbicacion = {
  socioId: string;
  ultima: Ubicacion | null;
  historial: Ubicacion[];
};

export type SaveUbicacionInput = {
  latitud: number;
  longitud: number;
  precisionMetros?: number | null;
};
