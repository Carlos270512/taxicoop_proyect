import { HttpError } from '../../Shared/domain/HttpError';
import { ELECTION_STATUSES, ElectionStatus } from '../domain/Election';

const TITLE_MAX = 150;
const DESCRIPTION_MAX = 1000;

export function assertElectionTitle(value: unknown): string {
  const title = String(value ?? '').trim();

  if (title.length < 3 || title.length > TITLE_MAX) {
    throw new HttpError(400, `El título debe tener entre 3 y ${TITLE_MAX} caracteres.`);
  }

  return title;
}

export function assertElectionDescription(value: unknown): string {
  const description = String(value ?? '').trim();

  if (description.length > DESCRIPTION_MAX) {
    throw new HttpError(400, `La descripción no puede superar ${DESCRIPTION_MAX} caracteres.`);
  }

  return description;
}

export function assertElectionDates(startValue: unknown, endValue: unknown): { startDate: Date; endDate: Date } {
  const startDate = new Date(String(startValue ?? ''));
  const endDate = new Date(String(endValue ?? ''));

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new HttpError(400, 'Las fechas de inicio y fin son obligatorias y deben ser válidas.');
  }

  if (endDate.getTime() <= startDate.getTime()) {
    throw new HttpError(400, 'La fecha de fin debe ser posterior a la fecha de inicio.');
  }

  return { startDate, endDate };
}

export function assertElectionOptions(value: unknown): Array<{ title: string; description: string }> {
  if (!Array.isArray(value) || value.length < 2) {
    throw new HttpError(400, 'La elección necesita al menos 2 opciones de voto.');
  }

  const options = value.map((option: any, index: number) => {
    const title = String(option?.title ?? '').trim();

    if (title.length < 1 || title.length > TITLE_MAX) {
      throw new HttpError(400, `La opción ${index + 1} debe tener entre 1 y ${TITLE_MAX} caracteres.`);
    }

    return {
      title,
      description: String(option?.description ?? '').trim(),
    };
  });

  const normalized = options.map((option) => option.title.toLowerCase());
  if (new Set(normalized).size !== normalized.length) {
    throw new HttpError(400, 'Las opciones no pueden repetirse.');
  }

  return options;
}

export function parseElectionStatus(value: unknown, fallback?: ElectionStatus): ElectionStatus {
  if (value === undefined || value === null || value === '') {
    if (fallback) return fallback;
    throw new HttpError(400, `El estado es obligatorio (${ELECTION_STATUSES.join(', ')}).`);
  }

  const status = String(value).trim().toUpperCase() as ElectionStatus;
  if (!ELECTION_STATUSES.includes(status)) {
    throw new HttpError(400, `Estado inválido. Valores permitidos: ${ELECTION_STATUSES.join(', ')}.`);
  }

  return status;
}
