import type { ElectionFormValues } from './types';

export type ElectionFormErrors = {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  options?: string;
};

export function validateElectionForm(values: ElectionFormValues): ElectionFormErrors {
  const errors: ElectionFormErrors = {};

  if (values.title.trim().length < 3 || values.title.trim().length > 150) {
    errors.title = 'Entre 3 y 150 caracteres.';
  }

  if (values.description.trim().length > 1000) {
    errors.description = 'Máximo 1000 caracteres.';
  }

  if (!values.startDate) {
    errors.startDate = 'La fecha de inicio es obligatoria.';
  }

  if (!values.endDate) {
    errors.endDate = 'La fecha de fin es obligatoria.';
  }

  if (values.startDate && values.endDate && values.endDate <= values.startDate) {
    errors.endDate = 'Debe ser posterior a la fecha de inicio.';
  }

  const options = values.options.map((option) => option.trim()).filter(Boolean);

  if (options.length < 2) {
    errors.options = 'Agrega al menos 2 opciones de voto.';
  } else if (new Set(options.map((option) => option.toLowerCase())).size !== options.length) {
    errors.options = 'Las opciones no pueden repetirse.';
  }

  return errors;
}
