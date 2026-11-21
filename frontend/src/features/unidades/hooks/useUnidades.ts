import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unidadesApi } from '../api/unidades.api';
import type { CreateUnidadInput, UnidadEstado, UnidadFilters, UpdateUnidadInput } from '../model/types';

export const unidadKeys = {
  all: ['unidades'] as const,
  list: (filters: UnidadFilters) => [...unidadKeys.all, 'list', filters] as const,
  detail: (id: string) => [...unidadKeys.all, 'detail', id] as const,
};

export function useUnidades(filters: UnidadFilters) {
  return useQuery({
    queryKey: unidadKeys.list(filters),
    queryFn: () => unidadesApi.list(filters),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

function useInvalidateUnidades() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: unidadKeys.all });
    void queryClient.invalidateQueries({ queryKey: ['socios'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
  };
}

export function useUnidadMutations() {
  const invalidate = useInvalidateUnidades();

  const create = useMutation({
    mutationFn: (input: CreateUnidadInput) => unidadesApi.create(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUnidadInput }) => unidadesApi.update(id, input),
    onSuccess: invalidate,
  });

  const changeEstado = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: UnidadEstado }) => unidadesApi.changeEstado(id, estado),
    onSuccess: invalidate,
  });

  const retire = useMutation({
    mutationFn: (id: string) => unidadesApi.retire(id),
    onSuccess: invalidate,
  });

  return { create, update, changeEstado, retire };
}
