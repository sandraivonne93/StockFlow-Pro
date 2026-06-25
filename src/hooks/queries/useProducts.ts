import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productService, type ProductListParams } from '@/services';
import type { ProductInput } from '@/types';

export const productKeys = {
  all: ['products'] as const,
  list: (params: ProductListParams) => ['products', 'list', params] as const,
  every: ['products', 'all'] as const,
};

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.list(params),
  });
}

export function useAllProducts() {
  return useQuery({
    queryKey: productKeys.every,
    queryFn: () => productService.listAll(),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => productService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      productService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}
