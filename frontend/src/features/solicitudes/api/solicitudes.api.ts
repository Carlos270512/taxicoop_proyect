import { api } from '@shared/api';
import type { ApiResponse, Paginated } from '@shared/api';
import type { Archivo, ArchivoTipo, CedulaData, Solicitud } from '../model/types';

export const solicitudesApi = {
  list: (params: { estado?: string; page: number; limit: number }) =>
    api.get<Paginated<Solicitud>>('/solicitudes', { params }).then((response) => response.data),

  create: (socioSalienteId?: string | null) =>
    api.post<ApiResponse<Solicitud>>('/solicitudes', { socioSalienteId }).then((response) => response.data.data),

  get: (id: string) => api.get<ApiResponse<Solicitud>>(`/solicitudes/${id}`).then((response) => response.data.data),

  approve: (id: string) =>
    api
      .patch<ApiResponse<{ solicitud: Solicitud; socioId: string }>>(`/solicitudes/${id}/aprobar`)
      .then((response) => response.data.data),

  reject: (id: string, motivo: string) =>
    api.patch<ApiResponse<Solicitud>>(`/solicitudes/${id}/rechazar`, { motivo }).then((response) => response.data.data),

  cedula: (documento: string) =>
    api.get<ApiResponse<CedulaData>>(`/solicitudes/cedula/${documento}`).then((response) => response.data.data),

  archivoBlob: (id: string) =>
    api.get<Blob>(`/solicitudes/archivos/${id}`, { responseType: 'blob' }).then((response) => response.data),

  publica: (token: string) =>
    api.get<ApiResponse<Solicitud>>(`/solicitudes/publicas/${token}`).then((response) => response.data.data),

  publicaCedula: (token: string, documento: string) =>
    api
      .get<ApiResponse<CedulaData>>(`/solicitudes/publicas/${token}/cedula/${documento}`)
      .then((response) => response.data.data),

  subirArchivo: (token: string, tipo: ArchivoTipo, file: File) => {
    const form = new FormData();
    form.append('tipo', tipo);
    form.append('archivo', file);

    return api
      .post<ApiResponse<Archivo>>(`/solicitudes/publicas/${token}/archivos`, form, {
        timeout: 60000,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => response.data.data);
  },

  enviar: (token: string, payload: Record<string, unknown>) =>
    api.post<ApiResponse<Solicitud>>(`/solicitudes/publicas/${token}`, payload).then((response) => response.data.data),
};

/** Descarga el documento cifrado a través del backend y lo abre en una pestaña nueva. */
export async function abrirArchivo(id: string): Promise<void> {
  const blob = await solicitudesApi.archivoBlob(id);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
