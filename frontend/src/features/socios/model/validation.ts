import type { SocioFormValues } from './types';

const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'.\s-]{2,100}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SocioFormErrors = Partial<Record<keyof SocioFormValues, string>>;

/**
 * Validacion en cliente: replica las reglas del backend para dar feedback
 * inmediato. La validacion real (y obligatoria) es la del servidor.
 */
export function validateSocioForm(values: SocioFormValues, mode: 'create' | 'edit'): SocioFormErrors {
  const errors: SocioFormErrors = {};

  if (!/^\d{10}$|^\d{13}$/.test(values.cedulaRuc.trim())) {
    errors.cedulaRuc = 'Debe tener 10 (cédula) o 13 (RUC) dígitos.';
  }

  if (!NAME_PATTERN.test(values.nombres.trim())) {
    errors.nombres = 'Mínimo 2 caracteres, solo letras.';
  }

  if (!NAME_PATTERN.test(values.apellidos.trim())) {
    errors.apellidos = 'Mínimo 2 caracteres, solo letras.';
  }

  if (!/^\d{7,15}$/.test(values.telefono.replace(/\s+/g, ''))) {
    errors.telefono = 'Entre 7 y 15 dígitos.';
  }

  if (mode === 'create') {
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      errors.email = 'Correo electrónico no válido.';
    }

    if (values.password.length < 8) {
      errors.password = 'Mínimo 8 caracteres.';
    }
  }

  return errors;
}
