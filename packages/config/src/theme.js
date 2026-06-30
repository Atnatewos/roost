// ROOST Design System
// All colors, spacing, typography in one place

const theme = {
  colors: {
    primary: '#E63946',
    primaryDark: '#C1121F',
    primaryLight: '#FF6B6B',
    secondary: '#1D3557',
    accent: '#F4A261',
    success: '#2A9D8F',
    error: '#E63946',
    warning: '#E9C46A',
    
    background: '#FFFFFF',
    surface: '#FAFAFA',
    
    textPrimary: '#212121',
    textSecondary: '#616161',
    textInverse: '#FFFFFF',
    
    border: '#E0E0E0',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 25px rgba(0,0,0,0.1)',
  },

  font: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
    },
    weight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
};

export default theme;
