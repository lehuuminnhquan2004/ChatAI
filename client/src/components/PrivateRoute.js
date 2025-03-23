import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

function PrivateRoute({ children }) {
  const user = authService.getUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute; 