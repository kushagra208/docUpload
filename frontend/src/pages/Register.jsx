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

export const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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
      const response = await authAPI.register(
        formData.username,
        formData.email,
        formData.password,
        formData.confirmPassword
      );
      login(response.data.user, response.data.token, response.data.refreshToken);
      navigate('/dashboard');
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
            Create Account
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
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Enter username"
            />

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

            <TextField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Confirm password"
            />

            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              size="large"
              fullWidth
              sx={{ mt: 1 }}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
            Already have account?{' '}
            <MuiLink
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ cursor: 'pointer' }}
            >
              Login here
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;
