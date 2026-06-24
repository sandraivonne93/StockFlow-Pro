import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantService, type TenantListParams } from '@/services';
import type { TenantInput } from '@/types';
import { TenantStatus } from '@/config';

/** Claves de caché para las consultas de tiendas. */
export const tenantKeys = {
  all: ['tenants'] as const,
  list: (params: TenantListParams) => ['tenants', 'list', params] as const,
  every: ['tenants', 'all'] as const,
};

/** Lista paginada de tiendas con filtros. */
export function useTenants(params: TenantListParams) {
  return useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () => tenantService.list(params),
  });
}

/** Todas las tiendas (para estadísticas). */
export function useAllTenants() {
  return useQuery({
    queryKey: tenantKeys.every,
    queryFn: () => tenantService.listAll(),
  });
}

/** Crea una tienda e invalida las listas. */
export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TenantInput) => tenantService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}

/** Actualiza una tienda. */
export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TenantInput> }) =>
      tenantService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}

/** Activa/desactiva una tienda. */
export function useSetTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TenantStatus }) =>
      tenantService.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}

/** Elimina una tienda. */
export function useDeleteTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tenantService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}
