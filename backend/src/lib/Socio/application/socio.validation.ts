import { HttpError } from '../../Shared/domain/HttpError';
import { parsePagination as parsePaginationShared } from '../../Shared/application/pagination';
import { SOCIO_ESTADOS, SocioEstado } from '../domain/Socio';

const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'.\s-]{2,100}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertCedula(value: unknown): string {
  const cedula = String(value ?? '').trim();
  if (!/^\d{10}$|^\d{13}$/.test(cedula)) {
    throw new HttpError(400, 'La cédula/RUC debe tener 10 (cédula) o 13 (RUC) dígitos.');
  }
  return cedula;
}

export function assertName(value: unknown, field: 'nombres' | 'apellidos'): string {
  const name = String(value ?? '').trim();
  if (!NAME_PATTERN.test(name)) {
    throw new HttpError(400, `El campo ${field} debe tener al menos 2 caracteres y solo letras.`);
  }
  return name;
}

export function assertTelefono(value: unknown): string {
  const telefono = String(value ?? '').replace(/\s+/g, '');
  if (!/^\d{7,15}$/.test(telefono)) {
    throw new HttpError(400, 'El teléfono debe tener entre 7 y 15 dígitos.');
  }
  return telefono;
}

export function assertEmail(value: unknown): string {
  const email = String(value ?? '').trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > 100) {
    throw new HttpError(400, 'El correo electrónico no es válido.');
  }
  return email;
}

export function assertPassword(value: unknown): string {
  const password = String(value ?? '');
  if (password.length < 8) {
    throw new HttpError(400, 'La contraseña debe tener al menos 8 caracteres.');
  }
  return password;
}

export function parseEstado(value: unknown, fallback?: SocioEstado): SocioEstado {
  if (value === undefined || value === null || value === '') {
    if (fallback) return fallback;
    throw new HttpError(400, `El estado es obligatorio (${SOCIO_ESTADOS.join(', ')}).`);
  }

  const estado = String(value).trim().toUpperCase() as SocioEstado;
  if (!SOCIO_ESTADOS.includes(estado)) {
    throw new HttpError(400, `Estado inválido. Valores permitidos: ${SOCIO_ESTADOS.join(', ')}.`);
  }
  return estado;
}

export function parsePagination(page?: unknown, limit?: unknown): { page: number; limit: number } {
  return parsePaginationShared(page, limit);
}
