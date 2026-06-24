import type { Config } from 'tailwindcss';

/**
 * Configuración de Tailwind con paleta premium, sombras elevadas,
 * gradientes y animaciones personalizadas para StockFlow Pro.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Color de marca (brand) en escala completa.
        brand: {
          50: '#eef4ff',
          100: '#dae6ff',
          200: '#bdd3ff',
          300: '#90b6ff',
          400: '#5b8dff',
          500: '#3563ff',
          600: '#1f41f5',
          700: '#172fe1',
          800: '#1929b6',
          900: '#1b298f',
          950: '#151b57',
        },
        // Tokens semánticos que cambian según el tema (definidos en CSS vars).
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-muted': 'rgb(var(--color-surface-muted) / <alpha-value>)',
        content: 'rgb(var(--color-content) / <alpha-value>)',
        'content-muted': 'rgb(var(--color-content-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        // Niveles de elevación premium.
        'elevation-1': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'elevation-2': '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.06)',
        'elevation-3': '0 12px 32px -8px rgb(0 0 0 / 0.12), 0 4px 12px -4px rgb(0 0 0 / 0.08)',
        'elevation-4': '0 24px 60px -12px rgb(0 0 0 / 0.18)',
        glow: '0 0 0 1px rgb(53 99 255 / 0.2), 0 8px 24px -8px rgb(53 99 255 / 0.45)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3563ff 0%, #1f41f5 50%, #6d28d9 100%)',
        'gradient-subtle': 'linear-gradient(180deg, rgb(255 255 255 / 0.06) 0%, rgb(255 255 255 / 0) 100%)',
        'gradient-mesh':
          'radial-gradient(at 0% 0%, rgb(53 99 255 / 0.25) 0px, transparent 50%), radial-gradient(at 100% 0%, rgb(109 40 217 / 0.2) 0px, transparent 50%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        'scale-in': 'scale-in 0.18s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
