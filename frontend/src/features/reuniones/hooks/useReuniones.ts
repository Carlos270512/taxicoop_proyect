import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reunionesApi } from '../api/reuniones.api';

export const reunionKeys = {
  all: ['reuniones'] as const,
  list: (page: number) => [...reunionKeys.all, 'list', page] as const,
  detalle: (id: string) => [...reunionKeys.all, 'detalle', id] as const,
  mias: () => [...reunionKeys.all, 'mias'] as const,
};

export function useReuniones(page: number, limit = 9) {
  return useQuery({
    queryKey: [...reunionKeys.list(page), limit],
    queryFn: () => reunionesApi.list(page, limit),
    staleTime: 15_000,
  });
}

export function useReunionDetalle(id: string | null) {
  return useQuery({
    queryKey: reunionKeys.detalle(id ?? ''),
    queryFn: () => reunionesApi.detalle(id as string),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useMisReuniones() {
  return useQuery({
    queryKey: reunionKeys.mias(),
    queryFn: reunionesApi.mias,
    staleTime: 20_000,
    retry: false,
  });
}

export function useReunionMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: reunionKeys.all });

  const crear = useMutation({
    mutationFn: (input: { titulo: string; descripcion: string; fecha: string; eleccionId?: string | null }) =>
      reunionesApi.crear(input),
    onSuccess: invalidate,
  });

  const guardarAsistencia = useMutation({
    mutationFn: ({ id, registros }: { id: string; registros: Array<{ socioId: string; presente: boolean }> }) =>
      reunionesApi.guardarAsistencia(id, registros),
    onSuccess: invalidate,
  });

  const eliminar = useMutation({ mutationFn: (id: string) => reunionesApi.eliminar(id), onSuccess: invalidate });

  return { crear, guardarAsistencia, eliminar };
}
