import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { votacionApi } from '../api/votacion.api';
import type { CreateElectionInput, ElectionFilters, ElectionStatus } from '../model/types';

export const votacionKeys = {
  all: ['votacion'] as const,
  list: (filters: ElectionFilters) => [...votacionKeys.all, 'list', filters] as const,
  active: () => [...votacionKeys.all, 'active'] as const,
  detail: (id: string) => [...votacionKeys.all, 'detail', id] as const,
  results: (id: string) => [...votacionKeys.all, 'results', id] as const,
};

export function useElections(filters: ElectionFilters) {
  return useQuery({
    queryKey: votacionKeys.list(filters),
    queryFn: () => votacionApi.list(filters),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useActiveElections() {
  return useQuery({
    queryKey: votacionKeys.active(),
    queryFn: votacionApi.active,
    staleTime: 15_000,
  });
}

export function useElection(id: string | undefined) {
  return useQuery({
    queryKey: votacionKeys.detail(id ?? ''),
    queryFn: () => votacionApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useElectionResults(id: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: votacionKeys.results(id ?? ''),
    queryFn: () => votacionApi.results(id as string),
    enabled: Boolean(id) && enabled,
  });
}

function useInvalidateVotacion() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: votacionKeys.all });
    void queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
  };
}

export function useVotacionMutations() {
  const invalidate = useInvalidateVotacion();

  const create = useMutation({
    mutationFn: (input: CreateElectionInput) => votacionApi.create(input),
    onSuccess: invalidate,
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ElectionStatus }) => votacionApi.changeStatus(id, status),
    onSuccess: invalidate,
  });

  const vote = useMutation({
    mutationFn: ({ electionId, optionId }: { electionId: string; optionId: string }) =>
      votacionApi.vote(electionId, optionId),
    onSuccess: invalidate,
  });

  return { create, changeStatus, vote };
}
