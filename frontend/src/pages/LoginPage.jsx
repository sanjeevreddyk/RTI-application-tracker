import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Alert, Box, Button, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { login, register } from '../features/auth/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const { token, loading, error } = useSelector((state) => state.auth);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [localError, setLocalError] = useState('');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setLocalError('');

    if (!form.email.trim() || !form.password.trim()) {
      setLocalError('Email and password are required');
      return;
    }

    if (mode === 'register' && !form.name.trim()) {
      setLocalError('Name is required');
      return;
    }

    if (mode === 'register') {
      await dispatch(register(form));
      return;
    }

    await dispatch(login({ email: form.email, password: form.password }));
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background:
          'radial-gradient(circle at 15% 15%, #d4ebe9 0%, transparent 38%), radial-gradient(circle at 85% 5%, #e6eefc 0%, transparent 35%), #eef3f7'
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 440, p: 3, bgcolor: 'rgb(255 255 255 / 88%)', backdropFilter: 'blur(10px)' }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={800}>RTI CMS Login</Typography>
          <Typography variant="body2" color="text.secondary">Secure access to your RTI case dashboard</Typography>

          <ToggleButtonGroup
            exclusive
            value={mode}
            onChange={(_e, next) => next && setMode(next)}
            size="small"
            fullWidth
          >
            <ToggleButton value="login">Login</ToggleButton>
            <ToggleButton value="register">Register</ToggleButton>
          </ToggleButtonGroup>

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={1.5}>
              {mode === 'register' && (
                <TextField label="Name" name="name" value={form.name} onChange={onChange} required />
              )}
              <TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
              <TextField label="Password" name="password" type="password" value={form.password} onChange={onChange} required />

              {!!localError && <Alert severity="error">{localError}</Alert>}
              {!!error && <Alert severity="error">{error}</Alert>}

              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'register' ? 'Register' : 'Login'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}