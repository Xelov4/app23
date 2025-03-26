export const colors = {
  primary: {
    50: 'oklch(0.97 0.03 270)', // Très léger violet
    100: 'oklch(0.94 0.05 270)', // Léger violet
    200: 'oklch(0.91 0.08 270)', // Plus visible
    300: 'oklch(0.88 0.11 270)', // Moyen
    400: 'oklch(0.76 0.14 270)', // Plus soutenu
    500: 'oklch(0.64 0.17 270)', // Couleur principale
    600: 'oklch(0.52 0.19 270)', // Plus foncé
    700: 'oklch(0.39 0.21 270)', // Encore plus foncé
    800: 'oklch(0.27 0.23 270)', // Très foncé
    900: 'oklch(0.14 0.25 270)', // Extrêmement foncé
  },
  neutral: {
    50: 'oklch(0.98 0 0)', // Très léger gris
    100: 'oklch(0.95 0 0)', // Léger gris
    200: 'oklch(0.92 0 0)', // Plus visible
    300: 'oklch(0.89 0 0)', // Moyen
    400: 'oklch(0.77 0 0)', // Plus soutenu
    500: 'oklch(0.65 0 0)', // Couleur principale
    600: 'oklch(0.52 0 0)', // Plus foncé
    700: 'oklch(0.40 0 0)', // Encore plus foncé
    800: 'oklch(0.27 0 0)', // Très foncé
    900: 'oklch(0.15 0 0)', // Extrêmement foncé
  },
  accent: {
    50: 'oklch(0.97 0.03 30)', // Très léger orange-rouge
    100: 'oklch(0.94 0.06 30)', // Léger orange-rouge
    200: 'oklch(0.91 0.09 30)', // Plus visible
    300: 'oklch(0.88 0.12 30)', // Moyen
    400: 'oklch(0.76 0.15 30)', // Plus soutenu
    500: 'oklch(0.64 0.18 30)', // Couleur principale
    600: 'oklch(0.52 0.21 30)', // Plus foncé
    700: 'oklch(0.39 0.24 30)', // Encore plus foncé
    800: 'oklch(0.27 0.27 30)', // Très foncé
    900: 'oklch(0.14 0.30 30)', // Extrêmement foncé
  },
  success: {
    50: 'oklch(0.97 0.03 150)', // Très léger vert
    100: 'oklch(0.94 0.06 150)', // Léger vert
    200: 'oklch(0.91 0.09 150)', // Plus visible
    300: 'oklch(0.88 0.12 150)', // Moyen
    400: 'oklch(0.76 0.15 150)', // Plus soutenu
    500: 'oklch(0.64 0.18 150)', // Couleur principale
    600: 'oklch(0.52 0.21 150)', // Plus foncé
    700: 'oklch(0.39 0.24 150)', // Encore plus foncé
    800: 'oklch(0.27 0.27 150)', // Très foncé
    900: 'oklch(0.14 0.30 150)', // Extrêmement foncé
  }
};

export const typography = {
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
  },
  fontWeights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500, 
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  fontFamilies: {
    sans: 'var(--font-sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif)',
    mono: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace)',
  }
};

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
};

export const borderRadius = {
  none: '0',
  xs: '0.125rem',    // 2px
  sm: '0.25rem',     // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
};

export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

export const animations = {
  spinSlow: 'spin 3s linear infinite',
  spin: 'spin 1s linear infinite',
  ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  bounce: 'bounce 1s infinite',
  fadeIn: 'fadeIn 0.5s ease-out',
  slideInFromTop: 'slideInFromTop 0.3s ease-out',
  slideInFromBottom: 'slideInFromBottom 0.3s ease-out',
  slideInFromLeft: 'slideInFromLeft 0.3s ease-out',
  slideInFromRight: 'slideInFromRight 0.3s ease-out',
};

export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndices = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
}; 