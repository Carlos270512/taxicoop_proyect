import { HttpError } from '../../Shared/domain/HttpError';
import { CedulaData } from '../domain/Solicitud';
import { CedulaProvider } from '../domain/SolicitudRepository';

type ZuinconsulResponse = {
  success?: boolean;
  error?: string;
  data?: {
    cedula?: string;
    nombres?: string;
    apellidos?: string;
    nombre_completo?: string;
    provincia?: string;
  };
};

/** Consulta de cédula/RUC contra ZUINCONSUL. El token vive solo en el backend. */
export class ZuinconsulCedulaProvider implements CedulaProvider {
  async consultar(documento: string, tipo: 'CI' | 'RUC'): Promise<CedulaData> {
    const url = process.env.ZUINCONSUL_URL;
    const token = process.env.ZUINCONSUL_TOKEN;

    if (!url || !token) {
      throw new HttpError(503, 'La consulta de cédula no está configurada (faltan ZUINCONSUL_URL/ZUINCONSUL_TOKEN).');
    }

    let response: Response;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ documento, tipo }),
        signal: AbortSignal.timeout(20_000),
      });
    } catch {
      throw new HttpError(502, 'No se pudo consultar el servicio de cédulas.');
    }

    const payload = (await response.json().catch(() => null)) as ZuinconsulResponse | null;

    if (!response.ok || !payload?.success || !payload.data) {
      const message = payload?.error ?? 'No se pudo consultar la cédula.';

      if (response.status === 422 || response.status === 404) {
        throw new HttpError(404, message);
      }

      throw new HttpError(502, message);
    }

    const { cedula, nombres, apellidos, nombre_completo, provincia } = payload.data;

    if (!nombres && !apellidos) {
      throw new HttpError(404, 'El servicio no devolvió nombres para esa cédula.');
    }

    return {
      cedula: cedula ?? documento,
      nombres: (nombres ?? '').trim(),
      apellidos: (apellidos ?? '').trim(),
      nombreCompleto: (nombre_completo ?? `${apellidos} ${nombres}`).trim(),
      provincia,
    };
  }
}
