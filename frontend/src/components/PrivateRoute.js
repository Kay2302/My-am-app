// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function PrivateRoute({ children, requireAdmin = false }) {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
  
  // Nếu yêu cầu quyền admin và người dùng không phải admin
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Nếu yêu cầu đăng nhập và người dùng chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

export default PrivateRoute;