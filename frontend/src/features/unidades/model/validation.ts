import type { UnidadFormValues } from './types';

const PLACA_PATTERN = /^[A-Za-z]{3}-?\d{3,4}$/;

export type UnidadFormErrors = Partial<Record<keyof UnidadFormValues, string>>;

export function validateUnidadForm(values: UnidadFormValues): UnidadFormErrors {
  const errors: UnidadFormErrors = {};

  if (!/^[A-Za-z0-9-]{1,20}$/.test(values.numeroUnidad.trim())) {
    errors.numeroUnidad = 'Entre 1 y 20 caracteres (letras, números o guiones).';
  }

  if (!PLACA_PATTERN.test(values.placa.trim())) {
    errors.placa = '3 letras y 3 o 4 dígitos (ej. ABC-1234).';
  }

  const anio = Number(values.anioVehiculo);
  const maximo = new Date().getFullYear() + 1;
  if (!Number.isInteger(anio) || anio < 1950 || anio > maximo) {
    errors.anioVehiculo = `Entre 1950 y ${maximo}.`;
  }

  if (!values.socioId) {
    errors.socioId = 'Selecciona el socio dueño de la unidad.';
  }

  return errors;
}
