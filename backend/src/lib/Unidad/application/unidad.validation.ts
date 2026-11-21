import { HttpError } from '../../Shared/domain/HttpError';
import { UNIDAD_ESTADOS, UnidadEstado } from '../domain/Unidad';

const PLACA_PATTERN = /^[A-Z]{3}-?\d{3,4}$/;
const NUMERO_PATTERN = /^[A-Z0-9-]{1,20}$/;

export function assertPlaca(value: unknown): string {
  const raw = String(value ?? '').trim().toUpperCase().replace(/\s+/g, '');

  if (!PLACA_PATTERN.test(raw)) {
    throw new HttpError(400, 'La placa debe tener 3 letras y 3 o 4 dígitos (ej. ABC-1234).');
  }

  return raw.includes('-') ? raw : `${raw.slice(0, 3)}-${raw.slice(3)}`;
}

export function assertNumeroUnidad(value: unknown): string {
  const numero = String(value ?? '').trim().toUpperCase();

  if (!NUMERO_PATTERN.test(numero)) {
    throw new HttpError(400, 'El número de unidad debe tener entre 1 y 20 caracteres (letras, números o guiones).');
  }

  return numero;
}

export function assertAnioVehiculo(value: unknown): number {
  const anio = Number(value);
  const maximo = new Date().getFullYear() + 1;

  if (!Number.isInteger(anio) || anio < 1950 || anio > maximo) {
    throw new HttpError(400, `El año del vehículo debe estar entre 1950 y ${maximo}.`);
  }

  return anio;
}

export function parseEstadoUnidad(value: unknown, fallback?: UnidadEstado): UnidadEstado {
  if (value === undefined || value === null || value === '') {
    if (fallback) return fallback;
    throw new HttpError(400, `El estado es obligatorio (${UNIDAD_ESTADOS.join(', ')}).`);
  }

  const estado = String(value).trim().toUpperCase() as UnidadEstado;
  if (!UNIDAD_ESTADOS.includes(estado)) {
    throw new HttpError(400, `Estado inválido. Valores permitidos: ${UNIDAD_ESTADOS.join(', ')}.`);
  }

  return estado;
}
