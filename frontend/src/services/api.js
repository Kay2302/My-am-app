// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Article API
export const articleApi = {
  getAll: () => {
    try {
      // If you don't have a backend running yet, use the context instead
      const articles = JSON.parse(localStorage.getItem('articles')) || [];
      console.log("Retrieved articles:", articles.length);
      return { data: articles };
      // When backend is ready, uncomment this:
      // return axios.get(`${API_URL}/articles`);
    } catch (error) {
      console.error("Error in articleApi.getAll:", error);
      return { data: [] };
    }
  },
  
  getById: (id) => {
    try {
      // Temporary solution using localStorage
      const articles = JSON.parse(localStorage.getItem('articles')) || [];
      const article = articles.find(a => a.id === parseInt(id));
      if (!article) {
        console.warn(`Article with id ${id} not found`);
      }
      return { data: article };
      // When backend is ready:
      // return axios.get(`${API_URL}/articles/${id}`);
    } catch (error) {
      console.error(`Error in articleApi.getById(${id}):`, error);
      return { data: null };
    }
  },
  
  getRelated: (id) => {
    try {
      // Temporary solution
      const articles = JSON.parse(localStorage.getItem('articles')) || [];
      // Filter approved articles only
      const approvedArticles = articles.filter(a => a.status === 'approved');
      // Get related articles (different from current, limit to 3)
      const relatedArticles = approvedArticles
        .filter(a => a.id !== parseInt(id))
        .slice(0, 3);
      return { data: relatedArticles };
      // When backend is ready:
      // return axios.get(`${API_URL}/articles/${id}/related`);
    } catch (error) {
      console.error(`Error in articleApi.getRelated(${id}):`, error);
      return { data: [] };
    }
  },
  
  create: (data) => {
    try {
      console.log("Creating article with data:", data);
      
      // Temporary solution
      const articles = JSON.parse(localStorage.getItem('articles')) || [];
      
      // Create a new article with a unique ID
      const newId = articles.length > 0 
        ? Math.max(...articles.map(a => typeof a.id === 'number' ? a.id : 0)) + 1 
        : 1;
      
      // Process image path if it's a relative path
      let imagePath = data.image;
      if (!imagePath.startsWith('http')) {
        // Ensure path starts with /
        if (!imagePath.startsWith('/')) {
          imagePath = '/' + imagePath;
        }
      }
      
      const newArticle = {
        ...data,
        id: newId,
        image: imagePath,
        date: data.date || new Date().toISOString(),
        averageRating: 0,
        totalRatings: 0,
        commentCount: 0
      };
      
      articles.push(newArticle);
      localStorage.setItem('articles', JSON.stringify(articles));
      
      console.log("Article created successfully:", newArticle);
      
      // Initialize empty comments array for this article
      const comments = JSON.parse(localStorage.getItem('comments')) || {};
      comments[newId] = [];
      localStorage.setItem('comments', JSON.stringify(comments));
      
      return { data: newArticle };
      // When backend is ready:
      // return axios.post(`${API_URL}/articles`, data);
    } catch (error) {
      console.error("Error in articleApi.create:", error);
      throw error; // Re-throw to allow proper error handling in the component
    }
  },
  
  update: (id, data) => {
    try {
      console.log(`Updating article ${id} with data:`, data);
      
      // Temporary solution
      const articles = JSON.parse(localStorage.getItem('articles')) || [];
      const index = articles.findIndex(a => a.id === parseInt(id));
      
      if (index !== -1) {
        // Process image path if it's a relative path
        let imagePath = data.image;
        if (!imagePath.startsWith('http')) {
          // Ensure path starts with /
          if (!imagePath.startsWith('/')) {
            imagePath = '/' + imagePath;
          }
        }
        
        // Update the article, preserving the id
        articles[index] = { 
          ...articles[index], 
          ...data,
          id: parseInt(id),
          image: imagePath
        };
        
        localStorage.setItem('articles', JSON.stringify(articles));
        console.log("Article updated successfully:", articles[index]);
        
        return { data: articles[index] };
      } else {
        console.error(`Article with id ${id} not found for update`);
        throw new Error(`Article with id ${id} not found`);
      }
      // When backend is ready:
      // return axios.put(`${API_URL}/articles/${id}`, data);
    } catch (error) {
      console.error(`Error in articleApi.update(${id}):`, error);
      throw error;
    }
  },
  
  delete: (id) => {
    try {
      console.log(`Deleting article ${id}`);
      
      // Temporary solution
      const articles = JSON.parse(localStorage.getItem('articles')) || [];
      const filteredArticles = articles.filter(a => a.id !== parseInt(id));
      
      if (filteredArticles.length === articles.length) {
        console.warn(`Article with id ${id} not found for deletion`);
      } else {
        localStorage.setItem('articles', JSON.stringify(filteredArticles));
        
        // Delete related comments
        const comments = JSON.parse(localStorage.getItem('comments')) || {};
        delete comments[id];
        localStorage.setItem('comments', JSON.stringify(comments));
        
        console.log(`Article ${id} and its comments deleted successfully`);
      }
      
      return { data: {} };
      // When backend is ready:
      // return axios.delete(`${API_URL}/articles/${id}`);
    } catch (error) {
      console.error(`Error in articleApi.delete(${id}):`, error);
      throw error;
    }
  },
  
  addRating: (id, data) => {
    try {
      console.log(`Adding rating to article ${id}:`, data);
      
      // Temporary solution
      const articles = JSON.parse(localStorage.getItem('articles')) || [];
      const article = articles.find(a => a.id === parseInt(id));
      
      if (article) {
        const totalRatings = (article.totalRatings || 0) + 1;
        const totalScore = (article.averageRating || 0) * (article.totalRatings || 0) + data.rating;
        const newAverageRating = totalScore / totalRatings;
        
        article.averageRating = newAverageRating;
        article.totalRatings = totalRatings;
        
        localStorage.setItem('articles', JSON.stringify(articles));
        console.log(`Rating added to article ${id}, new average: ${newAverageRating}`);
        
        return { 
          data: { 
            averageRating: newAverageRating, 
            totalRatings 
          } 
        };
      } else {
        console.error(`Article with id ${id} not found for rating`);
        throw new Error(`Article with id ${id} not found`);
      }
      // When backend is ready:
      // return axios.post(`${API_URL}/articles/${id}/ratings`, data);
    } catch (error) {
      console.error(`Error in articleApi.addRating(${id}):`, error);
      throw error;
    }
  },
  
  // Lấy bài viết theo tác giả
  getByAuthor: (author) => {
    try {
      console.log(`Getting articles by author: ${author}`);
      
      // Temporary solution
      const articles = JSON.parse(localStorage.getItem('articles')) || [];
      const authorArticles = articles.filter(article => article.author === author);
      
      console.log(`Found ${authorArticles.length} articles by ${author}`);
      return { data: authorArticles };
      // When backend is ready:
      // return axios.get(`${API_URL}/articles/author/${author}`);
    } catch (error) {
      console.error(`Error in articleApi.getByAuthor(${author}):`, error);
      return { data: [] };
    }
  },

  // Phê duyệt bài viết
  approveArticle: (id) => {
    try {
      console.log(`Approving article ${id}`);
      
      // Temporary solution
      const articles = JSON.parse(localStorage.getItem('articles')) || [];
      const index = articles.findIndex(a => a.id === parseInt(id));
      
      if (index !== -1) {
        articles[index].status = 'approved';
        localStorage.setItem('articles', JSON.stringify(articles));
        console.log(`Article ${id} approved successfully`);
        
        return { data: articles[index] };
      } else {
        console.error(`Article with id ${id} not found for approval`);
        throw new Error(`Article with id ${id} not found`);
      }
      // When backend is ready:
      // return axios.put(`${API_URL}/articles/${id}/approve`);
    } catch (error) {
      console.error(`Error in articleApi.approveArticle(${id}):`, error);
      throw error;
    }
  },

  // Từ chối bài viết
  rejectArticle: (id) => {
    try {
      console.log(`Rejecting article ${id}`);
      
      // Temporary solution
      const articles = JSON.parse(localStorage.getItem('articles')) || [];
      const index = articles.findIndex(a => a.id === parseInt(id));
      
      if (index !== -1) {
        articles[index].status = 'rejected';
        localStorage.setItem('articles', JSON.stringify(articles));
        console.log(`Article ${id} rejected successfully`);
        
        return { data: articles[index] };
      } else {
        console.error(`Article with id ${id} not found for rejection`);
        throw new Error(`Article with id ${id} not found`);
      }
      // When backend is ready:
      // return axios.put(`${API_URL}/articles/${id}/reject`);
    } catch (error) {
      console.error(`Error in articleApi.rejectArticle(${id}):`, error);
      throw error;
    }
  },

  // Lấy các bài viết đang chờ phê duyệt
  getPendingArticles: () => {
    try {
      console.log("Getting pending articles");
      
      // Temporary solution
      const articles = JSON.parse(localStorage.getItem('articles')) || [];
      const pendingArticles = articles.filter(a => a.status === 'pending' || !a.status);
      
      console.log(`Found ${pendingArticles.length} pending articles`);
      return { data: pendingArticles };
      // When backend is ready:
      // return axios.get(`${API_URL}/articles/pending`);
    } catch (error) {
      console.error("Error in articleApi.getPendingArticles:", error);
      return { data: [] };
    }
  }
};

// Comment API
export const commentApi = {
  getAll: () => {
    try {
      console.log("Getting all comments");
      
      // Temporary solution
      const comments = [];
      const articles = JSON.parse(localStorage.getItem('articles')) || [];
      const commentsObj = JSON.parse(localStorage.getItem('comments')) || {};
      
      Object.keys(commentsObj).forEach(articleId => {
        const article = articles.find(a => a.id === parseInt(articleId));
        if (article) {
          commentsObj[articleId].forEach(comment => {
            comments.push({
              ...comment,
              articleTitle: article.title,
              article_id: parseInt(articleId)
            });
          });
        }
      });
      
      console.log(`Found ${comments.length} total comments`);
      return { data: comments };
      // When backend is ready:
      // return axios.get(`${API_URL}/comments`);
    } catch (error) {
      console.error("Error in commentApi.getAll:", error);
      return { data: [] };
    }
  },
  
  getByArticleId: (articleId) => {
    try {
      console.log(`Getting comments for article ${articleId}`);
      
      // Temporary solution
      const commentsObj = JSON.parse(localStorage.getItem('comments')) || {};
      const articleComments = commentsObj[articleId] || [];
      
      console.log(`Found ${articleComments.length} comments for article ${articleId}`);
      return { data: articleComments };
      // When backend is ready:
      // return axios.get(`${API_URL}/comments/${articleId}`);
    } catch (error) {
      console.error(`Error in commentApi.getByArticleId(${articleId}):`, error);
      return { data: [] };
    }
  },
  
  add: (articleId, data) => {
    try {
      console.log(`Adding comment to article ${articleId}:`, data);
      
      // Temporary solution
      const commentsObj = JSON.parse(localStorage.getItem('comments')) || {};
      const newComment = {
        id: Date.now(),
        ...data,
        date: new Date().toISOString()
      };
      
      if (!commentsObj[articleId]) {
        commentsObj[articleId] = [];
      }
      
      commentsObj[articleId].unshift(newComment);
      localStorage.setItem('comments', JSON.stringify(commentsObj));
      
      // Update article comment count
      const articles = JSON.parse(localStorage.getItem('articles')) || [];
      const articleIndex = articles.findIndex(a => a.id === parseInt(articleId));
      
      if (articleIndex !== -1) {
        articles[articleIndex].commentCount = (articles[articleIndex].commentCount || 0) + 1;
        localStorage.setItem('articles', JSON.stringify(articles));
      }
      
      console.log(`Comment added to article ${articleId} successfully`);
      return { data: newComment };
      // When backend is ready:
      // return axios.post(`${API_URL}/comments/${articleId}`, data);
    } catch (error) {
      console.error(`Error in commentApi.add(${articleId}):`, error);
      throw error;
    }
  },
  
  delete: (id) => {
    try {
      console.log(`Deleting comment ${id}`);
      
      // Temporary solution
      const commentsObj = JSON.parse(localStorage.getItem('comments')) || {};
      let deleted = false;
      let articleId = null;
      
      Object.keys(commentsObj).forEach(artId => {
        const index = commentsObj[artId].findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
          commentsObj[artId].splice(index, 1);
          deleted = true;
          articleId = artId;
        }
      });
      
      if (deleted) {
        localStorage.setItem('comments', JSON.stringify(commentsObj));
        
        // Update article comment count
        if (articleId) {
          const articles = JSON.parse(localStorage.getItem('articles')) || [];
          const articleIndex = articles.findIndex(a => a.id === parseInt(articleId));
          
          if (articleIndex !== -1) {
            articles[articleIndex].commentCount = Math.max((articles[articleIndex].commentCount || 0) - 1, 0);
            localStorage.setItem('articles', JSON.stringify(articles));
          }
        }
        
        console.log(`Comment ${id} deleted successfully`);
      } else {
        console.warn(`Comment with id ${id} not found for deletion`);
      }
      
      return { data: {} };
      // When backend is ready:
      // return axios.delete(`${API_URL}/comments/${id}`);
    } catch (error) {
      console.error(`Error in commentApi.delete(${id}):`, error);
      throw error;
    }
  }
};