import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Types pour les mocks
type MockSearchParams = {
  [key: string]: string | string[] | null;
};

type MockRouter = {
  push?: jest.Mock;
  replace?: jest.Mock;
  back?: jest.Mock;
  prefetch?: jest.Mock;
  pathname?: string;
  query?: Record<string, string>;
};

// Options pour le rendu personnalisé
interface CustomRenderOptions extends RenderOptions {
  searchParams?: MockSearchParams;
  router?: MockRouter;
  pathname?: string;
}

/**
 * Fonction utilitaire pour construire un mock de useSearchParams
 */
export function createMockSearchParams(params: MockSearchParams = {}) {
  return {
    get: jest.fn((key: string) => {
      const value = params[key];
      if (Array.isArray(value)) return value.join(',');
      return value || null;
    }),
    getAll: jest.fn((key: string) => {
      const value = params[key];
      if (Array.isArray(value)) return value;
      if (value) return [value];
      return [];
    }),
    has: jest.fn((key: string) => params[key] !== undefined && params[key] !== null),
    toString: jest.fn(() => {
      return Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}=${value.join(',')}`;
          }
          return `${key}=${value}`;
        })
        .join('&');
    }),
  };
}

/**
 * Fonction de rendu personnalisée avec contexte Next.js
 */
export function renderWithNextContext(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    searchParams = {},
    router = {},
    pathname = '/test',
    ...renderOptions
  } = options;

  // Création du mock pour next/navigation
  jest.mock('next/navigation', () => ({
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      ...router,
    }),
    usePathname: () => pathname,
    useSearchParams: () => createMockSearchParams(searchParams),
  }));

  return render(ui, renderOptions);
}

export * from '@testing-library/react'; 