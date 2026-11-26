export type Reglamento = {
  id: string;
  titulo: string;
  descripcion: string | null;
  nombreOriginal: string;
  mimeType: string;
  tamano: number;
  createdAt: string;
};

export type NuevoReglamento = {
  titulo: string;
  descripcion?: string | null;
  nombreOriginal: string;
  mimeType: string;
  tamano: number;
  ruta: string;
  subidoPor?: string | null;
};
