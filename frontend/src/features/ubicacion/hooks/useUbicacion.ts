import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ubicacionApi } from '../api/ubicacion.api';
import type { SaveUbicacionInput } from '../model/types';

export const ubicacionKeys = {
  all: ['ubicacion'] as const,
  me: () => [...ubicacionKeys.all, 'me'] as const,
  socio: (socioId: string) => [...ubicacionKeys.all, 'socio', socioId] as const,
};

export function useMiUbicacion() {
  return useQuery({
    queryKey: ubicacionKeys.me(),
    queryFn: ubicacionApi.me,
    staleTime: 60_000,
    retry: false,
  });
}

export function useSocioUbicacion(socioId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ubicacionKeys.socio(socioId ?? ''),
    queryFn: () => ubicacionApi.bySocio(socioId as string),
    enabled: Boolean(socioId) && enabled,
    retry: false,
  });
}

export function useUbicacionMutations() {
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: (input: SaveUbicacionInput) => ubicacionApi.save(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ubicacionKeys.all });
    },
  });

  return { save };
}
