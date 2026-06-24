# StockFlow Pro

SaaS multi-tenant de control de inventario. React 18 + TypeScript estricto + Vite + TailwindCSS + Supabase.

## Estado del proyecto

- ✅ **Fase 1 — Fundación** (completada): proyecto, tema premium, modo oscuro, componentes UI base, layout con sidebar colapsable, router con lazy loading, 404, ESLint + Prettier, tests.
- ⏳ Fase 2 — Autenticación (Supabase Auth + landing pública)
- ⏳ Fase 3 — Panel Super Admin
- ⏳ Fase 4 — Inventario Core
- ⏳ Fase 5 — Exportación y Reportes
- ⏳ Fase 6 — Despliegue

## Requisitos

- Node.js 18+ (probado con Node 24)
- npm

## Arranque rápido

```bash
npm install
cp .env.example .env   # En Windows: copy .env.example .env
npm run dev            # http://localhost:5173
```

> En la Fase 1 la app funciona sin Supabase. Las claves se configuran en la Fase 2.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (typecheck + bundle) |
| `npm run preview` | Previsualiza el build |
| `npm run lint` | ESLint (0 warnings permitidos) |
| `npm run format` | Formatea con Prettier |
| `npm run typecheck` | Verificación de tipos |
| `npm run test` | Tests con Vitest |

## Estructura

```
src/
├── components/
│   ├── ui/          # Button, Input, Modal, Toast, Card, Table, Badge, Spinner, Skeleton
│   ├── layout/      # AppLayout, Sidebar, Topbar, navegación
│   └── common/      # ThemeToggle, ErrorBoundary
├── config/          # env (validado con Zod), constantes, enums
├── hooks/           # custom hooks
├── lib/             # supabase, queryClient, utils (cn, format)
├── pages/           # Dashboard, 404, placeholders (lazy)
├── routes/          # AppRouter (lazy + Suspense), paths
├── store/           # Zustand: theme, sidebar, toast
├── types/           # interfaces y tipos compartidos
└── test/            # setup de Vitest
```

## Convenciones

- TypeScript estricto (sin `any`), interfaces sobre types, enums para estados fijos.
- Barrel exports (`index.ts`) por carpeta.
- Tokens de tema vía CSS variables (`--color-surface`, etc.) para light/dark.
- Comentarios en español.
