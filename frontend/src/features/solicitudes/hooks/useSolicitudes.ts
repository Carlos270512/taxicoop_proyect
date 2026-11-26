import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { socioKeys } from '@features/socios';
import { unidadKeys } from '@features/unidades';
import { solicitudesApi } from '../api/solicitudes.api';

export const solicitudKeys = {
  all: ['solicitudes'] as const,
  list: (estado: string) => [...solicitudKeys.all, 'list', estado] as const,
  detalle: (id: string) => [...solicitudKeys.all, 'detalle', id] as const,
  publica: (token: string) => [...solicitudKeys.all, 'publica', token] as const,
};

export function useSolicitudes(estado: string, page: number, limit = 10) {
  return useQuery({
    queryKey: [...solicitudKeys.list(estado), page, limit],
    queryFn: () => solicitudesApi.list({ estado: estado || undefined, page, limit }),
    staleTime: 15_000,
  });
}

export function useSolicitudPublica(token?: string) {
  return useQuery({
    queryKey: solicitudKeys.publica(token ?? ''),
    queryFn: () => solicitudesApi.publica(token as string),
    enabled: Boolean(token),
    retry: false,
    staleTime: 10_000,
  });
}

export function useSolicitudMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: solicitudKeys.all });
    void queryClient.invalidateQueries({ queryKey: socioKeys.all });
    void queryClient.invalidateQueries({ queryKey: unidadKeys.all });
  };

  const create = useMutation({ mutationFn: (socioSalienteId?: string | null) => solicitudesApi.create(socioSalienteId) });
  const approve = useMutation({ mutationFn: (id: string) => solicitudesApi.approve(id), onSuccess: invalidateAll });
  const reject = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) => solicitudesApi.reject(id, motivo),
    onSuccess: invalidateAll,
  });
  const submit = useMutation({
    mutationFn: ({ token, payload }: { token: string; payload: Record<string, unknown> }) =>
      solicitudesApi.enviar(token, payload),
    onSuccess: invalidateAll,
  });
  const upload = useMutation({
    mutationFn: ({ token, tipo, file }: { token: string; tipo: 'LICENCIA' | 'CONTRATO' | 'MATRICULA'; file: File }) =>
      solicitudesApi.subirArchivo(token, tipo, file),
  });

  return { create, approve, reject, submit, upload };
}
