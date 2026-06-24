import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invitationService, type CreateInvitationInput } from '@/services';

export const invitationKeys = {
  all: ['invitations'] as const,
  list: (tenantId?: string) => ['invitations', 'list', tenantId ?? 'all'] as const,
};

/** Lista de invitaciones (todas o de una tienda). */
export function useInvitations(tenantId?: string) {
  return useQuery({
    queryKey: invitationKeys.list(tenantId),
    queryFn: () => invitationService.list(tenantId),
  });
}

/** Crea una invitación. */
export function useCreateInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInvitationInput) => invitationService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: invitationKeys.all }),
  });
}

/** Revoca una invitación. */
export function useRevokeInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invitationService.revoke(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: invitationKeys.all }),
  });
}

/** Elimina una invitación. */
export function useDeleteInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invitationService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: invitationKeys.all }),
  });
}
