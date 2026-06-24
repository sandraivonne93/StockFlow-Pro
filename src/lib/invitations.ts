import type { Invitation } from '@/types';

/** Mensaje por defecto que acompaña la invitación por WhatsApp. */
export const DEFAULT_INVITE_MESSAGE = 'Deseo obtener su programa de control de inventarios';

/** Construye el link único de registro para una invitación. */
export function buildInviteLink(token: string): string {
  return `${window.location.origin}/registro?token=${token}`;
}

/**
 * Construye el enlace de WhatsApp (wa.me) con el mensaje y el link de registro.
 * Si la invitación trae teléfono, lo usa como destinatario.
 */
export function buildWhatsAppLink(invitation: Invitation, customMessage?: string): string {
  const link = buildInviteLink(invitation.token);
  const baseMessage = customMessage?.trim() || DEFAULT_INVITE_MESSAGE;
  const text = encodeURIComponent(
    `${baseMessage}\n\nRegístrate aquí: ${link}\n(Enlace válido hasta tu invitación)`,
  );
  // Normalizamos el teléfono quitando todo lo que no sea dígito.
  const phone = invitation.phone?.replace(/\D/g, '') ?? '';
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}
