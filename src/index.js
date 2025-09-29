import ReactDOM from 'react-dom/client';
import * as THREE from 'three';
import App from './App';
import './index.css';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { initAmbient, AmbientAPI } from './audio/ambient';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#7C4DFF' },
    secondary: { main: '#FF7043' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained',
      },
    },
  },
});

async function bootstrap() {
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  await initAmbient(camera);

  if (typeof window !== 'undefined') {
    window.__athensDebug = {
      ...(window.__athensDebug || {}),
      audioAPI: AmbientAPI,
    };
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <App />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

bootstrap().catch(err => console.error('[ambient] bootstrap failed', err));
