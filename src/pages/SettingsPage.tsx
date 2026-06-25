import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Store, ImagePlus, Save, Info } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Button,
  useToast,
  SkeletonText,
} from '@/components/ui';
import { useAuth } from '@/hooks';
import { useMyTenant, useUpdateMyTenant } from '@/hooks';
import { authService, storageService } from '@/services';
import { getAuthErrorMessage } from '@/lib/authErrors';

const DEFAULT_COLOR = '#3563ff';

/**
 * Configuración: cada usuario edita su cuenta y, si pertenece a una tienda,
 * puede personalizar SU PROPIA tienda (nombre, color y logo).
 */
export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const toast = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-content">Configuración</h1>
        <p className="text-content-muted">Gestiona tu cuenta y tu tienda.</p>
      </div>

      <AccountCard
        fullName={user?.fullName ?? ''}
        email={user?.email ?? ''}
        onSave={async (fullName) => {
          if (!user) return;
          try {
            await authService.updateProfile(user.id, { fullName });
            await refreshProfile();
            toast.success('Cuenta actualizada');
          } catch (error) {
            toast.error('No se pudo actualizar', getAuthErrorMessage(error));
          }
        }}
      />

      {user?.tenantId ? (
        <MyStoreCard tenantId={user.tenantId} />
      ) : (
        <Card>
          <CardContent className="flex items-center gap-3 py-6 text-content-muted">
            <Info className="h-5 w-5 shrink-0 text-brand-500" />
            <p className="text-sm">
              Como Super Admin, la personalización de cada tienda se gestiona desde la sección{' '}
              <strong className="text-content">Tiendas</strong>.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** Tarjeta de datos de la cuenta del usuario. */
function AccountCard({
  fullName,
  email,
  onSave,
}: {
  fullName: string;
  email: string;
  onSave: (fullName: string) => Promise<void>;
}) {
  const [name, setName] = useState(fullName);
  const [saving, setSaving] = useState(false);

  useEffect(() => setName(fullName), [fullName]);

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    await onSave(name);
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-brand-500" />
            <CardTitle>Mi cuenta</CardTitle>
          </div>
          <CardDescription>Tus datos personales.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Correo electrónico" value={email} disabled hint="El correo no se puede cambiar." />
          </div>
          <div className="flex justify-end">
            <Button leftIcon={<Save className="h-4 w-4" />} isLoading={saving} onClick={() => void handleSave()}>
              Guardar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Tarjeta para que el cliente edite su propia tienda. */
function MyStoreCard({ tenantId }: { tenantId: string }) {
  const toast = useToast();
  const { data: tenant, isLoading } = useMyTenant(tenantId);
  const updateMut = useUpdateMyTenant();
  const { refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rellena el formulario cuando llega la tienda.
  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setColor(tenant.themeColor ?? DEFAULT_COLOR);
      setLogoPreview(tenant.logoUrl);
    }
  }, [tenant]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (): Promise<void> => {
    try {
      let logoUrl = tenant?.logoUrl ?? null;
      if (logoFile) logoUrl = await storageService.uploadTenantLogo(tenantId, logoFile);
      await updateMut.mutateAsync({ name, themeColor: color, logoUrl });
      await refreshProfile();
      setLogoFile(null);
      toast.success('Tienda actualizada', 'Tus cambios se guardaron correctamente.');
    } catch {
      toast.error('No se pudo actualizar la tienda');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-brand-500" />
            <CardTitle>Mi tienda</CardTitle>
          </div>
          <CardDescription>Personaliza el nombre, el logo y el color de tu tienda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <SkeletonText lines={4} />
          ) : (
            <>
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-muted">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Store className="h-7 w-7 text-content-muted" />
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<ImagePlus className="h-4 w-4" />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Cambiar logo
                  </Button>
                  <p className="mt-1 text-xs text-content-muted">PNG o JPG, recomendado cuadrado.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Nombre de la tienda" value={name} onChange={(e) => setName(e.target.value)} />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-content">Color de marca</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-surface"
                      aria-label="Selector de color"
                    />
                    <Input value={color} onChange={(e) => setColor(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Límites (solo lectura: los define el Super Admin) */}
              {tenant && (
                <p className="text-xs text-content-muted">
                  Límites de tu plan: <strong className="text-content">{tenant.maxProducts}</strong> productos ·{' '}
                  <strong className="text-content">{tenant.maxUsers}</strong> usuarios. (Solo el administrador
                  puede cambiarlos.)
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  leftIcon={<Save className="h-4 w-4" />}
                  isLoading={updateMut.isPending}
                  onClick={() => void handleSave()}
                >
                  Guardar cambios
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
