import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { movementService, type MovementListParams } from '@/services';
import type { MovementInput } from '@/types';
import { productKeys } from './useProducts';

export const movementKeys = {
  all: ['movements'] as const,
  list: (params: MovementListParams) => ['movements', 'list', params] as const,
  recent: ['movements', 'recent'] as const,
};

export function useMovements(params: MovementListParams) {
  return useQuery({
    queryKey: movementKeys.list(params),
    queryFn: () => movementService.list(params),
  });
}

export function useRecentMovements() {
  return useQuery({
    queryKey: movementKeys.recent,
    queryFn: () => movementService.listRecent(30),
  });
}

export function useCreateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MovementInput) => movementService.create(input),
    onSuccess: () => {
      // El movimiento cambia el stock: invalidamos movimientos y productos.
      void qc.invalidateQueries({ queryKey: movementKeys.all });
      void qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
