import { supabase } from '@/lib/supabase';

const LOGOS_BUCKET = 'tenant-logos';
const PRODUCTS_BUCKET = 'product-images';

export const storageService = {
  /**
   * Sube el logo de una tienda y devuelve su URL pública.
   * La ruta incluye el id de la tienda para mantener aislamiento.
   */
  async uploadTenantLogo(tenantId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'png';
    const path = `${tenantId}/logo-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(LOGOS_BUCKET).upload(path, file, {
      upsert: true,
      cacheControl: '3600',
    });
    if (error) throw error;

    const { data } = supabase.storage.from(LOGOS_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Sube la imagen de un producto y devuelve su URL pública.
   * La ruta empieza por el id de la tienda para cumplir la política de Storage.
   */
  async uploadProductImage(tenantId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'png';
    const path = `${tenantId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage.from(PRODUCTS_BUCKET).upload(path, file, {
      upsert: true,
      cacheControl: '3600',
    });
    if (error) throw error;

    const { data } = supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },
};
