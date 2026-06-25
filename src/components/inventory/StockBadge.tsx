import { Badge } from '@/components/ui';
import type { Product } from '@/types';

/** Muestra el stock con color según el nivel (agotado/bajo/ok). */
export function StockBadge({ product }: { product: Product }) {
  const { currentStock, minStock, unit } = product;
  if (currentStock <= 0) {
    return (
      <Badge tone="danger" dot>
        Agotado
      </Badge>
    );
  }
  if (currentStock <= minStock) {
    return (
      <Badge tone="warning" dot>
        {currentStock} {unit}
      </Badge>
    );
  }
  return (
    <Badge tone="success" dot>
      {currentStock} {unit}
    </Badge>
  );
}
