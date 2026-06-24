import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks';
import { useToast } from '@/components/ui';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { UserRole } from '@/config';
import { PATHS } from '@/routes/paths';

const roleLabels: Record<UserRole, string> = {
  [UserRole.SuperAdmin]: 'Super Admin',
  [UserRole.StoreAdmin]: 'Administrador',
  [UserRole.StoreUser]: 'Usuario',
};

/** Menú de perfil con datos del usuario y cierre de sesión. */
export function UserMenu() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut();
      navigate(PATHS.LOGIN, { replace: true });
    } catch (error) {
      toast.error('Error al cerrar sesión', getAuthErrorMessage(error));
    }
  };

  const displayName = user?.fullName || user?.email || 'Usuario';
  const roleLabel = user ? roleLabels[user.role] : '';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="focus-ring flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-2 pr-2.5 text-content transition-colors hover:bg-surface-muted">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand text-white">
            <User className="h-4 w-4" />
          </span>
          <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:block">
            {displayName}
          </span>
          <ChevronDown className="hidden h-4 w-4 text-content-muted sm:block" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-56 origin-top-right animate-scale-in rounded-xl border border-border bg-surface p-1.5 shadow-elevation-3"
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-semibold text-content">{displayName}</p>
            <p className="truncate text-xs text-content-muted">{roleLabel}</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <DropdownMenu.Item
            onSelect={() => navigate(PATHS.SETTINGS)}
            className="focus-ring flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-content outline-none data-[highlighted]:bg-content-muted/10"
          >
            <Settings className="h-4 w-4" /> Configuración
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onSelect={() => void handleSignOut()}
            className="focus-ring flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-500/10 dark:text-red-400"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
