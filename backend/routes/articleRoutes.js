// backend/routes/articleRoutes.js
const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// Lấy tất cả bài viết
router.get('/', articleController.getAllArticles);

// Lấy chi tiết bài viết theo ID
router.get('/:id', articleController.getArticleById);

// Thêm bài viết mới
router.post('/', articleController.createArticle);

// Cập nhật bài viết
router.put('/:id', articleController.updateArticle);

// Xóa bài viết
router.delete('/:id', articleController.deleteArticle);

// Thêm đánh giá cho bài viết
router.post('/:id/ratings', articleController.addRating);

// Lấy các bài viết liên quan
router.get('/:id/related', articleController.getRelatedArticles);

module.exports = router;