/**
 * Tipos de la base de datos (espejo de las migraciones SQL).
 * Cuando instales el CLI de Supabase podrás autogenerarlos con:
 *   supabase gen types typescript --project-id <id> > src/types/database.ts
 * Por ahora los mantenemos a mano para tener tipado estricto.
 */
import type { UserRole, TenantStatus, InvitationStatus } from '@/config';

export interface TenantRow {
  id: string;
  name: string;
  slug: string;
  status: `${TenantStatus}`;
  logo_url: string | null;
  theme_color: string | null;
  max_products: number;
  max_users: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: `${UserRole}`;
  tenant_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvitationRow {
  id: string;
  tenant_id: string;
  email: string | null;
  phone: string | null;
  token: string;
  role: `${UserRole}`;
  status: `${InvitationStatus}`;
  created_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: TenantRow;
        Insert: Partial<TenantRow> & Pick<TenantRow, 'name' | 'slug'>;
        Update: Partial<TenantRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, 'id' | 'email'>;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      invitations: {
        Row: InvitationRow;
        Insert: Partial<InvitationRow> & Pick<InvitationRow, 'tenant_id'>;
        Update: Partial<InvitationRow>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      user_role: `${UserRole}`;
      tenant_status: `${TenantStatus}`;
      invitation_status: `${InvitationStatus}`;
    };
    CompositeTypes: Record<never, never>;
  };
}
