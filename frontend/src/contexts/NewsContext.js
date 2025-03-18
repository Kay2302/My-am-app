// src/contexts/NewsContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

let tinTucData = [];
try {
  tinTucData = require('../Data/tinTucData').default;
} catch (error) {
  console.warn('Không thể tìm thấy dữ liệu từ tinTucData.js, sử dụng mảng rỗng.');
  tinTucData = [];
}
// Tạo context
const NewsContext = createContext();

// Hook để sử dụng context
export const useNews = () => useContext(NewsContext);

// Provider component
export const NewsProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);
  const [comments, setComments] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Khởi tạo dữ liệu
  useEffect(() => {
    // Lấy dữ liệu từ localStorage nếu có
    const savedArticles = localStorage.getItem('articles');
    const savedComments = localStorage.getItem('comments');

    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    } else {
      // Nếu không có, sử dụng dữ liệu mặc định
      setArticles(tinTucData.map(article => ({
        ...article,
        averageRating: 0,
        totalRatings: 0,
        commentCount: 0
      })));
    }

    if (savedComments) {
      setComments(JSON.parse(savedComments));
    } else {
      // Khởi tạo object comments trống
      const initialComments = {};
      tinTucData.forEach(article => {
        initialComments[article.id] = [];
      });
      setComments(initialComments);
    }

    setIsLoading(false);
  }, []);

  // Lưu dữ liệu vào localStorage khi có thay đổi
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('articles', JSON.stringify(articles));
      localStorage.setItem('comments', JSON.stringify(comments));
    }
  }, [articles, comments, isLoading]);

  // Thêm tin tức mới
  const addArticle = (newArticle) => {
    const id = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
    const articleWithMetadata = {
      ...newArticle,
      id,
      date: new Date().toISOString().split('T')[0],
      averageRating: 0,
      totalRatings: 0,
      commentCount: 0
    };
    
    setArticles([...articles, articleWithMetadata]);
    setComments({
      ...comments,
      [id]: []
    });
  };

  // Cập nhật tin tức
  const updateArticle = (id, updatedArticle) => {
    setArticles(articles.map(article => 
      article.id === id 
        ? { ...article, ...updatedArticle, id } 
        : article
    ));
  };

  // Xóa tin tức
  const deleteArticle = (id) => {
    setArticles(articles.filter(article => article.id !== id));
    
    // Xóa comments của bài viết
    const newComments = { ...comments };
    delete newComments[id];
    setComments(newComments);
  };

  // Thêm comment mới
  const addComment = (articleId, newComment) => {
    const commentWithId = {
      id: Date.now(),
      ...newComment,
      date: new Date().toLocaleDateString('vi-VN')
    };
    
    setComments({
      ...comments,
      [articleId]: [commentWithId, ...(comments[articleId] || [])]
    });
    
    // Cập nhật số lượng comment trong bài viết
    setArticles(articles.map(article => {
      if (article.id === articleId) {
        return {
          ...article,
          commentCount: (article.commentCount || 0) + 1
        };
      }
      return article;
    }));
  };

  // Thêm đánh giá mới
  const addRating = (articleId, rating) => {
    setArticles(articles.map(article => {
      if (article.id === articleId) {
        const totalRatings = (article.totalRatings || 0) + 1;
        const totalScore = (article.averageRating || 0) * (article.totalRatings || 0) + rating;
        const newAverageRating = totalScore / totalRatings;
        
        return {
          ...article,
          averageRating: newAverageRating,
          totalRatings: totalRatings
        };
      }
      return article;
    }));
  };

  // Xóa comment
  const deleteComment = (articleId, commentId) => {
    if (comments[articleId]) {
      setComments({
        ...comments,
        [articleId]: comments[articleId].filter(comment => comment.id !== commentId)
      });
      
      // Cập nhật số lượng comment trong bài viết
      setArticles(articles.map(article => {
        if (article.id === articleId) {
          return {
            ...article,
            commentCount: Math.max((article.commentCount || 0) - 1, 0)
          };
        }
        return article;
      }));
    }
  };

  // Lấy tin tức theo ID
  const getArticleById = (id) => {
    return articles.find(article => article.id === id) || null;
  };

  // Lấy comments của một bài viết
  const getCommentsByArticleId = (articleId) => {
    return comments[articleId] || [];
  };

  // Các giá trị và hàm được cung cấp qua context
  const value = {
    articles,
    comments,
    isLoading,
    addArticle,
    updateArticle,
    deleteArticle,
    addComment,
    deleteComment,
    addRating,
    getArticleById,
    getCommentsByArticleId
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
};