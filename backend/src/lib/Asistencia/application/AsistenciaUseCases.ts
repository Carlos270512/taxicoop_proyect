import { HttpError } from '../../Shared/domain/HttpError';
import { AsistenciaRegistro, AsistenciaResumen } from '../domain/Asistencia';
import { AsistenciaRepository } from '../domain/AsistenciaRepository';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function assertFecha(value: unknown): string {
  const fecha = String(value ?? '').trim();

  if (!DATE_PATTERN.test(fecha) || Number.isNaN(new Date(`${fecha}T00:00:00`).getTime())) {
    throw new HttpError(400, 'La fecha debe tener el formato AAAA-MM-DD.');
  }

  return fecha;
}

export function parseRegistros(value: unknown): AsistenciaRegistro[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new HttpError(400, 'Debes enviar la lista de asistencias.');
  }

  return value.map((item) => {
    const registro = item as { socioId?: unknown; presente?: unknown };
    const socioId = String(registro.socioId ?? '').trim();

    if (!socioId) {
      throw new HttpError(400, 'Cada registro necesita el socio.');
    }

    return { socioId, presente: Boolean(registro.presente) };
  });
}

/** Lista la asistencia de un día. */
export class GetAsistenciaUseCase {
  constructor(private readonly asistenciaRepository: AsistenciaRepository) {}

  async run(fecha: unknown): Promise<AsistenciaResumen> {
    return this.asistenciaRepository.findByFecha(assertFecha(fecha));
  }
}

/** El administrador marca la asistencia de un día. */
export class SaveAsistenciaUseCase {
  constructor(private readonly asistenciaRepository: AsistenciaRepository) {}

  async run(fecha: unknown, registros: unknown, userId: string): Promise<AsistenciaResumen> {
    return this.asistenciaRepository.saveMany(assertFecha(fecha), parseRegistros(registros), userId);
  }
}
