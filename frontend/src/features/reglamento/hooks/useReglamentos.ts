import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reglamentoApi } from '../api/reglamento.api';

export const reglamentoKeys = {
  all: ['reglamentos'] as const,
};

export function useReglamentos() {
  return useQuery({
    queryKey: reglamentoKeys.all,
    queryFn: reglamentoApi.list,
    staleTime: 30_000,
    retry: false,
  });
}

export function useReglamentoMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: reglamentoKeys.all });

  const subir = useMutation({
    mutationFn: (input: { titulo: string; descripcion: string; archivo: File }) => reglamentoApi.subir(input),
    onSuccess: invalidate,
  });

  const eliminar = useMutation({ mutationFn: (id: string) => reglamentoApi.eliminar(id), onSuccess: invalidate });

  return { subir, eliminar };
}
