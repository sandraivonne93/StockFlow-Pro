-- ============================================================
-- StockFlow Pro · Migración 0006 · Endurecimiento de seguridad
-- Ejecuta ESTO después de 0001–0005.
--
-- Objetivo: impedir que un usuario "se ascienda" cambiando su propio
-- role o tenant_id mediante llamadas directas a la API.
--
-- Cómo: con privilegios A NIVEL DE COLUMNA. El usuario (rol `authenticated`)
-- solo podrá actualizar `full_name` y `avatar_url` de profiles. Cambiar role
-- o tenant_id queda reservado a las funciones SECURITY DEFINER
-- (claim_invitation), que se ejecutan con privilegios del dueño y NO se ven
-- afectadas por esta restricción.
-- ============================================================

-- Quitamos el permiso de UPDATE global sobre profiles a los roles públicos…
revoke update on public.profiles from anon, authenticated;

-- …y lo concedemos SOLO sobre las columnas seguras al usuario autenticado.
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- ============================================================
-- Recordatorio (no es SQL):
-- • El registro público (disable_signup) sigue habilitado a propósito,
--   porque el flujo de invitación usa signUp para crear la cuenta del
--   invitado. Para cerrarlo del todo más adelante, conviene mover la
--   creación del usuario a una Edge Function con la service_role key.
-- • RLS por tenant ya está activo en tenants, profiles, invitations,
--   categories, products y stock_movements (migraciones 0001–0005).
-- ============================================================
