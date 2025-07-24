// theme.ts
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#FFF6E9',
    },
    text: {
      primary: '#333',
      secondary: '#555',
    },
  },
});
