import { Menu, Search, Bell } from 'lucide-react';
import { useSidebarStore } from '@/store';
import { ThemeToggle } from '@/components/common';
import { Input } from '@/components/ui';
import { UserMenu } from './UserMenu';

/** Barra superior con búsqueda, notificaciones, tema y perfil. */
export function Topbar() {
  const openMobile = useSidebarStore((s) => s.openMobile);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-xl">
      {/* Botón menú móvil */}
      <button
        onClick={openMobile}
        className="focus-ring rounded-xl border border-border p-2 text-content lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Búsqueda */}
      <div className="hidden flex-1 sm:block sm:max-w-md">
        <Input
          placeholder="Buscar productos, movimientos…"
          leftIcon={<Search className="h-4 w-4" />}
          aria-label="Buscar"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-content transition-colors hover:bg-surface-muted"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-surface" />
        </button>

        <ThemeToggle />

        <UserMenu />
      </div>
    </header>
  );
}
