import { Badge } from '@/components/ui';
import { TenantStatus } from '@/config';

const statusConfig: Record<TenantStatus, { label: string; tone: 'success' | 'gray' | 'warning' }> = {
  [TenantStatus.Active]: { label: 'Activa', tone: 'success' },
  [TenantStatus.Inactive]: { label: 'Inactiva', tone: 'gray' },
  [TenantStatus.Pending]: { label: 'Pendiente', tone: 'warning' },
};

/** Badge con el estado de una tienda. */
export function TenantStatusBadge({ status }: { status: TenantStatus }) {
  const { label, tone } = statusConfig[status];
  return (
    <Badge tone={tone} dot>
      {label}
    </Badge>
  );
}
