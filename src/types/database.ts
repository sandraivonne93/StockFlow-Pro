/**
 * Tipos de la base de datos (espejo de las migraciones SQL).
 * Cuando instales el CLI de Supabase podrás autogenerarlos con:
 *   supabase gen types typescript --project-id <id> > src/types/database.ts
 * Por ahora los mantenemos a mano para tener tipado estricto.
 */
import type { UserRole, TenantStatus, InvitationStatus, MovementType } from '@/config';

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

export interface TenantInsert {
  name: string;
  slug: string;
  status?: `${TenantStatus}`;
  logo_url?: string | null;
  theme_color?: string | null;
  max_products?: number;
  max_users?: number;
}

export interface TenantUpdate {
  name?: string;
  slug?: string;
  status?: `${TenantStatus}`;
  logo_url?: string | null;
  theme_color?: string | null;
  max_products?: number;
  max_users?: number;
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

export interface ProfileInsert {
  id: string;
  email: string;
  full_name?: string | null;
  role?: `${UserRole}`;
  tenant_id?: string | null;
  avatar_url?: string | null;
}

export interface ProfileUpdate {
  email?: string;
  full_name?: string | null;
  role?: `${UserRole}`;
  tenant_id?: string | null;
  avatar_url?: string | null;
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

export interface InvitationInsert {
  tenant_id: string;
  email?: string | null;
  phone?: string | null;
  role?: `${UserRole}`;
  status?: `${InvitationStatus}`;
  created_by?: string | null;
  // token, id, timestamps have DB defaults
}

export interface InvitationUpdate {
  status?: `${InvitationStatus}`;
  accepted_at?: string | null;
}

export interface CategoryRow {
  id: string;
  tenant_id: string;
  name: string;
  color: string | null;
  icon: string | null;
  created_at: string;
}

export interface ProductRow {
  id: string;
  tenant_id: string;
  category_id: string | null;
  code: string;
  name: string;
  description: string | null;
  cost_price: number;
  sale_price: number;
  current_stock: number;
  min_stock: number;
  unit: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MovementRow {
  id: string;
  tenant_id: string;
  product_id: string;
  type: `${MovementType}`;
  quantity: number;
  reason: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: Partial<CategoryRow> & Pick<CategoryRow, 'tenant_id' | 'name'>;
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: Partial<ProductRow> & Pick<ProductRow, 'tenant_id' | 'code' | 'name'>;
        Update: Partial<ProductRow>;
        Relationships: [];
      };
      stock_movements: {
        Row: MovementRow;
        Insert: Partial<MovementRow> & Pick<MovementRow, 'tenant_id' | 'product_id' | 'type' | 'quantity'>;
        Update: Partial<MovementRow>;
        Relationships: [];
      };
      tenants: {
        Row: TenantRow;
        Insert: TenantInsert;
        Update: TenantUpdate;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      invitations: {
        Row: InvitationRow;
        Insert: InvitationInsert;
        Update: InvitationUpdate;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      get_public_invitation: {
        Args: { p_token: string };
        Returns: {
          tenant_name: string;
          email: string | null;
          role: string;
          expires_at: string;
        }[];
      };
      claim_invitation: {
        Args: { p_token: string };
        Returns: { success: boolean; error?: string; tenant_id?: string; role?: string };
      };
      update_my_tenant: {
        Args: { p_name: string; p_theme_color: string | null; p_logo_url: string | null };
        Returns: { success: boolean; error?: string; tenant_id?: string };
      };
    };
    Enums: {
      user_role: `${UserRole}`;
      tenant_status: `${TenantStatus}`;
      invitation_status: `${InvitationStatus}`;
      movement_type: `${MovementType}`;
    };
    CompositeTypes: Record<never, never>;
  };
}
