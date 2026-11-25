import axios from 'axios';

/** Extrae el mensaje de error que devuelve la API ({ success:false, error }) */
export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté en línea.';
    }

    const data = error.response.data as { error?: string } | undefined;
    if (data?.error) return data.error;
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}

/** Código HTTP de la respuesta, si el error viene de la API. */
export function getApiErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
