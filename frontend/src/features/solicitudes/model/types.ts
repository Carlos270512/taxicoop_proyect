export type SolicitudEstado = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export type ArchivoTipo = 'LICENCIA' | 'CONTRATO' | 'MATRICULA';

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
  cedulaRuc?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  numeroUnidad?: string;
  placa?: string;
  anioVehiculo?: number;
  fechaExpiracion?: string;
};

export type Solicitud = {
  id: string;
  token: string;
  estado: SolicitudEstado;
  data: SolicitudData;
  archivos: Archivo[];
  socioSalienteId: string | null;
  socioSalienteNombre: string | null;
  socioId: string | null;
  motivoRechazo: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export type CedulaData = {
  cedula: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  provincia?: string;
};

export type SolicitudFormValues = {
  cedulaRuc: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  password: string;
  confirmPassword: string;
  direccion: string;
  numeroUnidad: string;
  placa: string;
  anioVehiculo: string;
};

export const EMPTY_SOLICITUD_FORM: SolicitudFormValues = {
  cedulaRuc: '',
  nombres: '',
  apellidos: '',
  telefono: '',
  email: '',
  password: '',
  confirmPassword: '',
  direccion: '',
  numeroUnidad: '',
  placa: '',
  anioVehiculo: String(new Date().getFullYear()),
};

export function fechaExpiracionDe(anio: number): number {
  return anio + VIGENCIA_MATRICULA_ANIOS;
}

export type SolicitudFormErrors = Partial<Record<keyof SolicitudFormValues, string>>;

export function validateSolicitudForm(values: SolicitudFormValues): SolicitudFormErrors {
  const errors: SolicitudFormErrors = {};
  const anio = Number(values.anioVehiculo);
  const anioActual = new Date().getFullYear();

  if (!/^\d{10}$|^\d{13}$/.test(values.cedulaRuc.trim())) {
    errors.cedulaRuc = 'La cédula debe tener 10 dígitos (o 13 si es RUC).';
  }
  if (values.nombres.trim().length < 2) errors.nombres = 'Ingresa los nombres.';
  if (values.apellidos.trim().length < 2) errors.apellidos = 'Ingresa los apellidos.';
  if (!/^\d{7,15}$/.test(values.telefono.replace(/\s+/g, ''))) errors.telefono = 'Teléfono de 7 a 15 dígitos.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Correo no válido.';
  if (values.password.length < 8) errors.password = 'Mínimo 8 caracteres.';
  if (values.password !== values.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden.';
  if (values.direccion.trim().length < 5) errors.direccion = 'Ingresa tu dirección.';
  if (!/^[A-Z0-9-]{1,20}$/.test(values.numeroUnidad.trim().toUpperCase())) {
    errors.numeroUnidad = 'Número de unidad inválido.';
  }
  if (!/^[A-Z]{3}-?\d{3,4}$/.test(values.placa.trim().toUpperCase().replace(/\s+/g, ''))) {
    errors.placa = 'Placa de 3 letras y 3-4 dígitos (ABC-1234).';
  }
  if (!Number.isInteger(anio) || anio < 1950 || anio > anioActual + 1) {
    errors.anioVehiculo = `Año entre 1950 y ${anioActual + 1}.`;
  }

  return errors;
}

export const ARCHIVO_LABELS: Record<ArchivoTipo, string> = {
  LICENCIA: 'Licencia de conducir',
  CONTRATO: 'Contrato de venta del puesto (notariado)',
  MATRICULA: 'Matrícula del vehículo',
};
