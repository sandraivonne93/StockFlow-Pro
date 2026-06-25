import { useState } from 'react';
import { Copy, Check, Plus, Trash2, Ban, MessageCircle } from 'lucide-react';
import { Modal, Input, Button, Badge, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui';
import {
  useInvitations,
  useCreateInvitation,
  useRevokeInvitation,
  useDeleteInvitation,
} from '@/hooks';
import { buildInviteLink, buildWhatsAppLink } from '@/lib/invitations';
import { formatDate } from '@/lib/utils';
import { InvitationStatus } from '@/config';
import type { Invitation, Tenant } from '@/types';

interface InvitationsModalProps {
  open: boolean;
  onClose: () => void;
  tenant: Tenant | null;
}

const statusTone: Record<InvitationStatus, { label: string; tone: 'warning' | 'success' | 'gray' | 'danger' }> = {
  [InvitationStatus.Pending]: { label: 'Pendiente', tone: 'warning' },
  [InvitationStatus.Accepted]: { label: 'Aceptada', tone: 'success' },
  [InvitationStatus.Expired]: { label: 'Expirada', tone: 'gray' },
  [InvitationStatus.Revoked]: { label: 'Revocada', tone: 'danger' },
};

/** Modal para generar y gestionar invitaciones de una tienda. */
export function InvitationsModal({ open, onClose, tenant }: InvitationsModalProps) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: invitations = [], isLoading } = useInvitations(tenant?.id);
  const createMut = useCreateInvitation();
  const revokeMut = useRevokeInvitation();
  const deleteMut = useDeleteInvitation();

  const handleCreate = async (): Promise<void> => {
    if (!tenant) return;
    try {
      await createMut.mutateAsync({
        tenantId: tenant.id,
        email: email.trim() || null,
        phone: phone.trim() || null,
      });
      setEmail('');
      setPhone('');
      toast.success('Invitación creada', 'Comparte el link con la persona invitada.');
    } catch {
      toast.error('No se pudo crear la invitación');
    }
  };

  const handleCopy = async (inv: Invitation): Promise<void> => {
    await navigator.clipboard.writeText(buildInviteLink(inv.token));
    setCopiedId(inv.id);
    toast.success('Link copiado');
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={`Invitaciones · ${tenant?.name ?? ''}`}
      description="Genera un link único de registro y compártelo por WhatsApp."
    >
      {/* Crear invitación */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-muted/60 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="Correo electrónico (opcional)"
            placeholder="invitado@tienda.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            label="Teléfono (opcional para WhatsApp)"
            placeholder="Ej. 521234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          isLoading={createMut.isPending}
          onClick={() => void handleCreate()}
          className="sm:mb-1"
        >
          Generar
        </Button>
      </div>

      {/* Lista de invitaciones */}
      <div className="mt-5 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : invitations.length === 0 ? (
          <p className="py-8 text-center text-sm text-content-muted">
            Aún no hay invitaciones para esta tienda.
          </p>
        ) : (
          invitations.map((inv) => {
            const { label, tone } = statusTone[inv.status];
            const isPending = inv.status === InvitationStatus.Pending;
            return (
              <div
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone={tone} dot>
                      {label}
                    </Badge>
                    {inv.email && <span className="text-xs text-content-muted">{inv.email}</span>}
                    {inv.phone && <span className="text-xs text-content-muted">{inv.phone}</span>}
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-content-muted">
                    {buildInviteLink(inv.token)}
                  </p>
                  <p className="text-xs text-content-muted">Expira: {formatDate(inv.expiresAt)}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={
                      copiedId === inv.id ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )
                    }
                    onClick={() => void handleCopy(inv)}
                  >
                    Copiar
                  </Button>
                  <a href={buildWhatsAppLink(inv)} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="success" leftIcon={<MessageCircle className="h-4 w-4" />}>
                      WhatsApp
                    </Button>
                  </a>
                  {isPending && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void revokeMut.mutateAsync(inv.id)}
                      aria-label="Revocar"
                    >
                      <Ban className="h-4 w-4 text-amber-500" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void deleteMut.mutateAsync(inv.id)}
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
