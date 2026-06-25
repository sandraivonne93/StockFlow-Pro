# 🚀 Guía de despliegue — StockFlow Pro

Esta guía te lleva de tu proyecto local a una app en producción (Vercel + Supabase).

---

## 0. Antes de empezar

Asegúrate de haber ejecutado **todas las migraciones SQL** en Supabase (en orden):

```
supabase/migrations/0001_init_auth.sql
supabase/migrations/0002_tenants_invitations.sql
supabase/migrations/0003_public_invitation_functions.sql
supabase/migrations/0004_tenant_self_service.sql
supabase/migrations/0005_inventory_core.sql
supabase/migrations/0006_security_hardening.sql   ← nueva (seguridad)
```

Cada una se pega en **Supabase → SQL Editor → New query → Run**.

---

## 1. Subir el código a GitHub

Si aún no lo has hecho:

```bash
git add .
git commit -m "StockFlow Pro listo para producción"
git push
```

> Al hacer push, se ejecutará automáticamente el workflow de CI
> (`.github/workflows/ci.yml`): lint + typecheck + tests + build.

---

## 2. Desplegar el frontend en Vercel

1. Entra a **https://vercel.com** e inicia sesión con GitHub.
2. **Add New… → Project** → importa tu repositorio `Control-de-almacen`.
3. Vercel detectará **Vite** automáticamente (ya incluimos `vercel.json`).
4. En **Environment Variables**, agrega estas dos (son públicas):

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | `https://fvrzqwlithlmttehhvsy.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | tu clave publishable (`sb_publishable_...`) |

5. Click en **Deploy**. En ~1 min tendrás una URL tipo `https://tu-app.vercel.app`.

---

## 3. Conectar Supabase con tu dominio de producción

Para que el login y los correos funcionen en producción:

1. Supabase → **Authentication → URL Configuration**.
2. **Site URL**: pon tu URL de Vercel (`https://tu-app.vercel.app`).
3. **Redirect URLs**: agrega:
   - `https://tu-app.vercel.app/login`
   - `https://tu-app.vercel.app/registro`
   - `https://tu-app.vercel.app/dashboard`

> Esto evita que los enlaces de confirmación de correo y recuperación de
> contraseña apunten a `localhost`.

---

## 4. (Opcional) Activar Google OAuth

1. **Google Cloud Console** → crea un OAuth Client ID (tipo *Web*).
2. Authorized redirect URI: `https://fvrzqwlithlmttehhvsy.supabase.co/auth/v1/callback`.
3. Copia el *Client ID* y *Client Secret*.
4. Supabase → **Authentication → Providers → Google** → pega las claves y activa.

El botón "Google" del login ya está implementado; al activarlo, funciona.

---

## 5. Backups de la base de datos

- **Plan Free de Supabase**: incluye backups diarios automáticos (retención limitada).
- Backup manual recomendado antes de cambios grandes:
  - Supabase → **Database → Backups** → *Download* / *Restore*.
  - O por consola: `supabase db dump -f backup.sql` (requiere Supabase CLI).

---

## 6. Checklist final de producción

- [ ] Migraciones 0001–0006 ejecutadas.
- [ ] Variables de entorno en Vercel configuradas.
- [ ] Site URL y Redirect URLs configuradas en Supabase.
- [ ] Claves **secretas** rotadas (las que se compartieron durante el desarrollo).
- [ ] RLS activo (lo está por las migraciones) — cada tienda ve solo sus datos.
- [ ] Probado: login, crear tienda, invitar, registrar invitado, productos,
      movimientos, reportes/Excel.

---

## Variables de entorno (resumen)

| Variable | Dónde | Pública |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Vercel + `.env` local | ✅ Sí |
| `VITE_SUPABASE_ANON_KEY` | Vercel + `.env` local | ✅ Sí (publishable) |
| `service_role` / `secret key` | **Nunca** en el frontend | ❌ No |
