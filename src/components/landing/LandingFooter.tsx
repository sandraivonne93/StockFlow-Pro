import { Package2 } from 'lucide-react';

const COLUMNS = [
  { title: 'Producto', links: ['Características', 'Precios', 'Seguridad', 'Novedades'] },
  { title: 'Empresa', links: ['Sobre nosotros', 'Blog', 'Contacto', 'Empleo'] },
  { title: 'Legal', links: ['Privacidad', 'Términos', 'Cookies'] },
];

/** Pie de página premium con columnas de enlaces. */
export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-white">
                <Package2 className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold text-content">StockFlow Pro</span>
            </div>
            <p className="mt-3 text-sm text-content-muted">
              Control de inventario multi-tienda, premium y seguro.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-content">{col.title}</h4>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-content-muted transition-colors hover:text-content"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-content-muted">
          © {new Date().getFullYear()} StockFlow Pro. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
