import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert as MuiAlert,
  Card,
  CardContent,
  Stack,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);
      login(response.data.user, response.data.accessToken, response.data.refreshToken);
      navigate('/dashboard');
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
            Login
          </Typography>

          {message && (
            <MuiAlert
              severity={message.type}
              onClose={() => setMessage('')}
              sx={{ mb: 2 }}
            >
              {message.text}
            </MuiAlert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Enter email"
            />

            <TextField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Enter password"
            />

            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              size="large"
              fullWidth
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
            Don't have account?{' '}
            <MuiLink
              component="button"
              variant="body2"
              onClick={() => navigate('/register')}
              sx={{ cursor: 'pointer' }}
            >
              Register here
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
