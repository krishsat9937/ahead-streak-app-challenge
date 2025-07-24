'use client';

import { lightTheme } from '@/app/theme';
import { ThemeProvider, CssBaseline } from '@mui/material';


export default function ThemeProviderClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
