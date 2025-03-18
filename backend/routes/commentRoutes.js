// backend/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Lấy tất cả bình luận (cho trang admin)
router.get('/', commentController.getAllComments);

// Lấy tất cả bình luận của một bài viết
router.get('/:articleId', commentController.getCommentsByArticleId);

// Thêm bình luận mới
router.post('/:articleId', commentController.addComment);

// Xóa bình lọan
router.delete('/:id', commentController.deleteComment);

module.exports = router;