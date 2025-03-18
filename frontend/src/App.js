// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import NewsDetail from './components/NewsDetail';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import BlogPostForm from './components/BlogPostForm';
import MyPosts from './components/MyPosts';
import EditBlogPost from './components/EditBlogPost';
import PrivateRoute from './components/PrivateRoute';
import ScrollToTop from './components/ScrollToTop';
import { NewsProvider } from './contexts/NewsContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [userRole, setUserRole] = useState(
    localStorage.getItem('userRole') || ''
  );

  useEffect(() => {
    // Initialize data if not exists
    if (!localStorage.getItem('articles')) {
      try {
        const tinTucData = require('./Data/tinTucData').default;
        const articles = tinTucData.map(article => ({
          ...article,
          status: 'approved', // Mặc định tất cả bài viết có sẵn là đã duyệt
          averageRating: 0,
          totalRatings: 0,
          commentCount: 0
        }));
        localStorage.setItem('articles', JSON.stringify(articles));
        
        // Initialize empty comments
        const comments = {};
        tinTucData.forEach(article => {
          comments[article.id] = [];
        });
        localStorage.setItem('comments', JSON.stringify(comments));
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    }

    // Lắng nghe sự thay đổi của trạng thái đăng nhập
    const handleStorageChange = () => {
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
      setUserRole(localStorage.getItem('userRole') || '');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setUserRole(localStorage.getItem('userRole') || '');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole('');
  };

  return (
    <NewsProvider>
      <Router>
        <ScrollToTop />
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/tin-tuc" element={<BlogPostForm />} />
  <Route path="/tin-tuc/:id" element={<NewsDetail />} />
  
  {/* Yêu cầu đăng nhập */}
  <Route path="/login" element={
    isAuthenticated ? 
      (userRole === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/my-posts" />) : 
      <Login onLogin={handleLogin} />
  } />
  
  {/* Trang yêu cầu đăng nhập */}
  <Route path="/create-post" element={
    <PrivateRoute>
      <BlogPostForm />
    </PrivateRoute>
  } />
  
  <Route path="/my-posts" element={
    <PrivateRoute>
      <MyPosts />
    </PrivateRoute>
  } />
  
  <Route path="/edit-post/:id" element={
    <PrivateRoute>
      <EditBlogPost />
    </PrivateRoute>
  } />
  
  {/* Trang Admin - yêu cầu quyền admin */}
  <Route path="/admin/*" element={
    <PrivateRoute requireAdmin={true}>
      <AdminDashboard onLogout={handleLogout} />
    </PrivateRoute>
  } />
  
  {/* Fallback route */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
      </Router>
    </NewsProvider>
  );
}

export default App;