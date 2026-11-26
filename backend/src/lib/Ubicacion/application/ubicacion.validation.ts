import { HttpError } from '../../Shared/domain/HttpError';
import { NuevaUbicacion } from '../domain/Ubicacion';

export type UbicacionInput = {
  latitud: unknown;
  longitud: unknown;
  precisionMetros?: unknown;
};

function toNumber(value: unknown, field: string): number {
  const parsed = typeof value === 'string' ? Number(value.replace(',', '.')) : value;

  if (typeof parsed !== 'number' || !Number.isFinite(parsed)) {
    throw new HttpError(400, `La ${field} no es un número válido.`);
  }

  return parsed;
}

/** Valida y normaliza la ubicación que envía el socio desde el navegador. */
export function parseUbicacionInput(input: UbicacionInput, socioId: string): NuevaUbicacion {
  const latitud = toNumber(input.latitud, 'latitud');
  const longitud = toNumber(input.longitud, 'longitud');

  if (latitud < -90 || latitud > 90) {
    throw new HttpError(400, 'La latitud debe estar entre -90 y 90.');
  }

  if (longitud < -180 || longitud > 180) {
    throw new HttpError(400, 'La longitud debe estar entre -180 y 180.');
  }

  let precisionMetros: number | null = null;

  if (input.precisionMetros !== undefined && input.precisionMetros !== null && input.precisionMetros !== '') {
    const precision = toNumber(input.precisionMetros, 'precisión');

    if (precision < 0) {
      throw new HttpError(400, 'La precisión no puede ser negativa.');
    }

    precisionMetros = precision;
  }

  return { socioId, latitud, longitud, precisionMetros, capturedAt: new Date() };
}
