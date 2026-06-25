import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PanelLeftClose, PanelLeft, Package2 } from 'lucide-react';
import { useSidebarStore } from '@/store';
import { useAuth, useAllProducts } from '@/hooks';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { NAV_ITEMS } from './navigation';
import { PATHS } from '@/routes/paths';

/** Sidebar colapsable con navegación, marca y microinteracciones. */
export function Sidebar() {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed);
  const closeMobile = useSidebarStore((s) => s.closeMobile);
  const { user, isSuperAdmin } = useAuth();
  const { data: products = [] } = useAllProducts();

  // Mostramos solo los ítems permitidos para el rol del usuario.
  const navItems = useMemo(
    () => NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role))),
    [user],
  );

  // Badge dinámico de alertas de stock bajo (solo para usuarios de tienda).
  const lowStockCount = useMemo(() => {
    if (!user || isSuperAdmin) return 0;
    return products.filter((p) => p.currentStock <= p.minStock).length;
  }, [products, user, isSuperAdmin]);

  const navWithBadges = useMemo(
    () =>
      navItems.map((item) =>
        item.to === PATHS.PRODUCTS
          ? { ...item, badge: lowStockCount > 0 ? lowStockCount : undefined }
          : item,
      ),
    [navItems, lowStockCount],
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex h-full flex-col border-r border-border bg-surface"
    >
      {/* Marca */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
          <Package2 className="h-5 w-5" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="truncate text-lg font-bold text-content"
          >
            StockFlow <span className="text-brand-500">Pro</span>
          </motion.span>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navWithBadges.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMobile}
              className={({ isActive }) =>
                cn(
                  'focus-ring group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
                    : 'text-content-muted hover:bg-content-muted/10 hover:text-content',
                  collapsed && 'justify-center',
                )
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute left-0 h-6 w-1 rounded-r-full bg-brand-500"
                    />
                  )}
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.badge ? (
                    <Badge tone="danger">{item.badge}</Badge>
                  ) : null}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Botón colapsar (solo escritorio) */}
      <div className="hidden border-t border-border p-3 lg:block">
        <button
          onClick={toggleCollapsed}
          className="focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-content-muted transition-colors hover:bg-content-muted/10 hover:text-content"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5" />
              <span>Colapsar</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
