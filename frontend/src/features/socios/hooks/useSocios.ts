import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sociosApi } from '../api/socios.api';
import type { CreateSocioInput, SocioEstado, SocioFilters, UpdateSocioInput } from '../model/types';

export const socioKeys = {
  all: ['socios'] as const,
  list: (filters: SocioFilters) => [...socioKeys.all, 'list', filters] as const,
  detail: (id: string) => [...socioKeys.all, 'detail', id] as const,
};

export function useSocios(filters: SocioFilters) {
  return useQuery({
    queryKey: socioKeys.list(filters),
    queryFn: () => sociosApi.list(filters),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

/** Invalida la lista de socios y el resumen del dashboard tras cada cambio */
function useInvalidateSocios() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: socioKeys.all });
    void queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
  };
}

export function useSocioMutations() {
  const invalidate = useInvalidateSocios();

  const create = useMutation({
    mutationFn: (input: CreateSocioInput) => sociosApi.create(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSocioInput }) => sociosApi.update(id, input),
    onSuccess: invalidate,
  });

  const changeEstado = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: SocioEstado }) => sociosApi.changeEstado(id, estado),
    onSuccess: invalidate,
  });

  const retire = useMutation({
    mutationFn: (id: string) => sociosApi.retire(id),
    onSuccess: invalidate,
  });

  return { create, update, changeEstado, retire };
}
