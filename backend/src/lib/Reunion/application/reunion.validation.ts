import { HttpError } from '../../Shared/domain/HttpError';
import { NuevaReunion } from '../domain/ReunionRepository';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function assertFechaReunion(value: unknown): string {
  const fecha = String(value ?? '').trim();

  if (!DATE_PATTERN.test(fecha) || Number.isNaN(new Date(`${fecha}T00:00:00`).getTime())) {
    throw new HttpError(400, 'La fecha de la reunión debe tener el formato AAAA-MM-DD.');
  }

  return fecha;
}

export function parseReunion(values: {
  titulo?: unknown;
  descripcion?: unknown;
  fecha?: unknown;
  eleccionId?: unknown;
}): NuevaReunion {
  const titulo = String(values.titulo ?? '').trim();

  if (titulo.length < 3 || titulo.length > 180) {
    throw new HttpError(400, 'El motivo de la reunión debe tener entre 3 y 180 caracteres.');
  }

  const descripcion = String(values.descripcion ?? '').trim();
  const eleccionId = values.eleccionId ? String(values.eleccionId).trim() : null;

  return {
    titulo,
    descripcion: descripcion || null,
    fecha: assertFechaReunion(values.fecha),
    eleccionId: eleccionId || null,
  };
}

export function parseRegistrosAsistencia(value: unknown): Array<{ socioId: string; presente: boolean }> {
  if (!Array.isArray(value) || value.length === 0) {
    throw new HttpError(400, 'Debes enviar la lista de asistencias.');
  }

  return value.map((item) => {
    const registro = item as { socioId?: unknown; presente?: unknown };
    const socioId = String(registro.socioId ?? '').trim();

    if (!socioId) throw new HttpError(400, 'Cada registro necesita el socio.');

    return { socioId, presente: Boolean(registro.presente) };
  });
}
