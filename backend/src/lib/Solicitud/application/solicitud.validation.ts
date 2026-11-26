import { HttpError } from '../../Shared/domain/HttpError';
import { SolicitudData, VIGENCIA_MATRICULA_ANIOS } from '../domain/Solicitud';
import { assertCedula, assertEmail, assertName, assertPassword, assertTelefono } from '../../Socio/application/socio.validation';
import { assertAnioVehiculo, assertNumeroUnidad, assertPlaca } from '../../Unidad/application/unidad.validation';

const EMAIL_PATTERN_SKIP = '__skip__';

function assertDireccion(value: unknown): string {
  const direccion = String(value ?? '').trim();
  if (direccion.length < 5 || direccion.length > 200) {
    throw new HttpError(400, 'La dirección debe tener entre 5 y 200 caracteres.');
  }
  return direccion;
}

export function assertDocumento(value: unknown): string {
  const documento = String(value ?? '').replace(/\D/g, '');
  if (documento.length !== 10 && documento.length !== 13) {
    throw new HttpError(400, 'La cédula/RUC debe tener 10 (cédula) o 13 (RUC) dígitos.');
  }
  return documento;
}

/** La matrícula vence a los 17 años del año del vehículo (31 de diciembre). */
export function fechaExpiracionDe(anioVehiculo: number): Date {
  return new Date(Date.UTC(anioVehiculo + VIGENCIA_MATRICULA_ANIOS, 11, 31, 23, 59, 59));
}

export type SolicitudFormInput = {
  cedulaRuc?: unknown;
  nombres?: unknown;
  apellidos?: unknown;
  telefono?: unknown;
  email?: unknown;
  password?: unknown;
  direccion?: unknown;
  numeroUnidad?: unknown;
  placa?: unknown;
  anioVehiculo?: unknown;
};

export type ParsedSolicitud = {
  data: SolicitudData;
  password: string;
  fechaExpiracion: Date;
};

/** Valida el formulario de postulación (público y administrativo). */
export function parseSolicitudForm(input: SolicitudFormInput): ParsedSolicitud {
  const anioVehiculo = assertAnioVehiculo(input.anioVehiculo);
  const fechaExpiracion = fechaExpiracionDe(anioVehiculo);
  const email = String(input.email ?? '').trim();
  const password = input.password === undefined || input.password === EMAIL_PATTERN_SKIP ? '' : String(input.password);

  if (password) assertPassword(password);
  assertEmail(email);

  const data: SolicitudData = {
    cedulaRuc: assertCedula(input.cedulaRuc),
    nombres: assertName(input.nombres, 'nombres'),
    apellidos: assertName(input.apellidos, 'apellidos'),
    telefono: assertTelefono(input.telefono),
    email,
    direccion: assertDireccion(input.direccion),
    numeroUnidad: assertNumeroUnidad(input.numeroUnidad),
    placa: assertPlaca(input.placa),
    anioVehiculo,
    fechaExpiracion: fechaExpiracion.toISOString(),
  };

  return { data, password, fechaExpiracion };
}

export function assertMotivo(value: unknown): string {
  const motivo = String(value ?? '').trim();

  if (motivo.length < 5 || motivo.length > 400) {
    throw new HttpError(400, 'El motivo del rechazo debe tener entre 5 y 400 caracteres.');
  }

  return motivo;
}
