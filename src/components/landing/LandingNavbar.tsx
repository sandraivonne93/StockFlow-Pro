import { Link } from 'react-router-dom';
import { Package2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { ThemeToggle } from '@/components/common';
import { PATHS } from '@/routes/paths';

const LINKS = [
  { label: 'Características', href: '#features' },
  { label: 'Precios', href: '#pricing' },
  { label: 'Testimonios', href: '#testimonials' },
];

/** Barra de navegación fija de la landing con efecto glass. */
export function LandingNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-surface/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={PATHS.ROOT} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
            <Package2 className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold text-content">
            StockFlow <span className="text-brand-500">Pro</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-content-muted transition-colors hover:text-content"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to={PATHS.LOGIN}>
            <Button size="sm">Iniciar sesión</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
