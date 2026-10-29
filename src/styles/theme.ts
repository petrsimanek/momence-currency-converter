export const theme = {
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1f2937',
    textMuted: '#5b6472',
    primary: '#1d4ed8',
    primaryHover: '#1e40af',
    primaryText: '#ffffff',
    onPrimarySurface: '#1e3a8a',
    onPrimaryMuted: '#c7d2fe',
    surfaceMuted: '#f1f5f9',
    selectedRow: '#e0e9ff',
    border: '#d5dbe3',
    danger: '#b91c1c',
    dangerSurface: '#fef2f2',
    focus: '#1d4ed8',
    focusOnDark: '#ffffff',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
  shadow: {
    card: '0 1px 2px rgb(15 23 42 / 0.06), 0 4px 14px rgb(15 23 42 / 0.07)',
  },
  space: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2.5rem',
  },
  breakpoints: {
    md: '40rem',
  },
} as const
