import { api } from '@shared/api';
import type { ApiResponse } from '@shared/api';
import type { Reglamento } from '../model/types';

export const reglamentoApi = {
  list: () => api.get<ApiResponse<Reglamento[]>>('/reglamentos').then((response) => response.data.data),

  subir: (input: { titulo: string; descripcion: string; archivo: File }) => {
    const form = new FormData();
    form.append('titulo', input.titulo);
    form.append('descripcion', input.descripcion);
    form.append('archivo', input.archivo);

    return api
      .post<ApiResponse<Reglamento>>('/reglamentos', form, {
        timeout: 60000,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => response.data.data);
  },

  eliminar: (id: string) => api.delete<ApiResponse<null>>(`/reglamentos/${id}`).then((response) => response.data),

  archivoBlob: (id: string) =>
    api.get<Blob>(`/reglamentos/${id}/archivo`, { responseType: 'blob' }).then((response) => response.data),
};

/** Abre el PDF descifrado en una pestaña nueva. */
export async function abrirReglamento(id: string): Promise<void> {
  const blob = await reglamentoApi.archivoBlob(id);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}
