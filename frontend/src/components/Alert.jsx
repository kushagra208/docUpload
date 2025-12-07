import React from 'react';
import { Alert as MuiAlert } from '@mui/material';
import { AlertTitle } from '@mui/material';

export const Alert = ({ type = 'success', message, onClose }) => {
  const severityMap = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  return (
    <MuiAlert 
      severity={severityMap[type] || 'info'} 
      onClose={onClose}
      sx={{ mb: 2 }}
    >
      {message}
    </MuiAlert>
  );
};

export default Alert;
