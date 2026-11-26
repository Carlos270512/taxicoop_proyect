/** Envoltorio de la API de geolocalización del navegador con mensajes claros. */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Tu navegador no soporta geolocalización.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        const messages: Record<number, string> = {
          1: 'Permiso de ubicación denegado. Actívalo en la configuración del navegador.',
          2: 'No se pudo obtener tu ubicación. Revisa el GPS o la conexión.',
          3: 'La ubicación tardó demasiado. Intenta de nuevo.',
        };
        reject(new Error(messages[error.code] ?? 'No se pudo obtener tu ubicación.'));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  });
}
