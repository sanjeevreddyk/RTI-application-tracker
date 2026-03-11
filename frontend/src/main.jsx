import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';
import { store } from './app/store';
import ToastHost from './components/ToastHost';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1f8df0' },
    secondary: { main: '#6c7a89' },
    background: {
      default: '#eef1f6',
      paper: '#ffffff'
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: '"Public Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h5: { fontWeight: 700, letterSpacing: -0.3 },
    h6: { fontWeight: 700, letterSpacing: -0.2 },
    subtitle1: { fontWeight: 650 }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#eef1f6'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #d8dee8',
          boxShadow: '0 3px 10px rgba(30, 55, 90, 0.05)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#334a66',
          backgroundColor: '#f7f9fc'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
          <ToastHost />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
