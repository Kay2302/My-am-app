// backend/controllers/commentController.js
const pool = require('../config/db');

// Lấy tất cả bình luận của một bài viết
exports.getCommentsByArticleId = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const [comments] = await pool.query(`
      SELECT * FROM comments
      WHERE article_id = ?
      ORDER BY date DESC
    `, [articleId]);
    
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Lỗi khi lấy bình luận' });
  }
};

// Thêm bình luận mới
exports.addComment = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { name, email, comment, rating } = req.body;
    
    if (!name || !email || !comment) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    // Kiểm tra bài viết tồn tại
    const [article] = await pool.query('SELECT * FROM articles WHERE id = ?', [articleId]);
    
    if (article.length === 0) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
    
    // Thêm bình luận mới
    const [result] = await pool.query(`
      INSERT INTO comments (article_id, name, email, comment, rating, date)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [articleId, name, email, comment, rating || 0]);
    
    const commentId = result.insertId;
    
    // Lấy bình luận vừa thêm
    const [newComment] = await pool.query('SELECT * FROM comments WHERE id = ?', [commentId]);
    
    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Lỗi khi thêm bình luận' });
  }
};

// Xóa bình luận
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM comments WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bình luận không tồn tại' });
    }
    
    res.status(200).json({ message: 'Xóa bình luận thành công' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Lỗi khi xóa bình luận' });
  }
};

// Lấy tất cả bình luận (cho trang admin)
exports.getAllComments = async (req, res) => {
  try {
    const [comments] = await pool.query(`
      SELECT c.*, a.title as articleTitle
      FROM comments c
      JOIN articles a ON c.article_id = a.id
      ORDER BY c.date DESC
    `);
    
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching all comments:', error);
    res.status(500).json({ message: 'Lỗi khi lấy tất cả bình luận' });
  }
};