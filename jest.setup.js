import '@testing-library/jest-dom';

// Mock pour next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '',
  useParams: () => ({}),
}));

// Supprimer les avertissements non pertinents des tests
global.console = {
  ...console,
  // Garder le logging normal en développement
  error: process.env.NODE_ENV === 'test' ? jest.fn() : console.error,
  warn: process.env.NODE_ENV === 'test' ? jest.fn() : console.warn,
  log: process.env.NODE_ENV === 'test' ? jest.fn() : console.log,
};

// Simuler les API de navigateur essentielles quand elles n'existent pas
if (typeof window !== 'undefined') {
  // LocalStorage mock
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });

  // Match media
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  
  // IntersectionObserver mock
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {
      this.observe = jest.fn();
      this.unobserve = jest.fn();
      this.disconnect = jest.fn();
    }
  };
}

// Réinitialiser tous les mocks après chaque test
afterEach(() => {
  jest.clearAllMocks();
});

// Mock des modules qui ne sont pas pertinents pour les tests
jest.mock('next/router', () => require('next-router-mock'));
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} />;
  },
}));

// Configuration globale pour les tests
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}; 