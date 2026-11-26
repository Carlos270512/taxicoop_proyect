export type SolicitudEstado = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export const SOLICITUD_ESTADOS: SolicitudEstado[] = ['PENDIENTE', 'APROBADA', 'RECHAZADA'];

export type ArchivoTipo = 'LICENCIA' | 'CONTRATO' | 'MATRICULA';

export const ARCHIVO_TIPOS: ArchivoTipo[] = ['LICENCIA', 'CONTRATO', 'MATRICULA'];

export const MIME_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_ARCHIVO_BYTES = 8 * 1024 * 1024;

/** Años de vigencia de la matrícula del vehículo a partir de su año de registro. */
export const VIGENCIA_MATRICULA_ANIOS = 17;

export type Archivo = {
  id: string;
  tipo: ArchivoTipo;
  nombreOriginal: string;
  mimeType: string;
  tamano: number;
  createdAt: string;
};

export type SolicitudData = {
  cedulaRuc: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  direccion: string;
  numeroUnidad: string;
  placa: string;
  anioVehiculo: number;
  fechaExpiracion: string;
};

export type Solicitud = {
  id: string;
  token: string;
  estado: SolicitudEstado;
  data: Partial<SolicitudData>;
  archivos: Archivo[];
  socioSalienteId: string | null;
  socioSalienteNombre: string | null;
  socioId: string | null;
  motivoRechazo: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export type NuevaSolicitud = {
  token: string;
  socioSalienteId: string | null;
};

export type CedulaData = {
  cedula: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  provincia?: string;
};
