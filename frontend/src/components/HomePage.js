// src/components/HomePage.js
import React, { useState, useEffect } from 'react';
import Nav from './Nav';
import Header from './Header';
import Home from './Home';
import TinTuc from './News';
import LienHe from './Contact';
import Footer from './Footer';
import { articleApi } from '../services/api';

function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApprovedArticles = async () => {
      try {
        setLoading(true);
        const response = await articleApi.getAll();
        
        // Lọc bài viết đã được phê duyệt
        const approvedArticles = response.data.filter(article => article.status === 'approved');
        
        // Cập nhật state với bài viết đã được phê duyệt
        setArticles(approvedArticles);
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error('Error fetching approved articles:', error);
        setError('Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchApprovedArticles();
  }, []);

  return (
    <div id="page-top">
      <Nav />
      <Header />
      <Home />
      <TinTuc 
        articles={articles} 
        loading={loading} 
        error={error} 
      />
      <LienHe />
      <Footer />
    </div>
  );
}

export default HomePage;