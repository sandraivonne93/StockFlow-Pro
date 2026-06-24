import { supabase } from '@/lib/supabase';

const LOGOS_BUCKET = 'tenant-logos';

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
};
