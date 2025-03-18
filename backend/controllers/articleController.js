// backend/controllers/articleController.js
const pool = require('../config/db');

// Lấy tất cả bài viết
exports.getAllArticles = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.*, 
        COALESCE(AVG(r.rating), 0) AS averageRating,
        COUNT(DISTINCT r.id) AS totalRatings,
        COUNT(DISTINCT c.id) AS commentCount
      FROM articles a
      LEFT JOIN ratings r ON a.id = r.article_id
      LEFT JOIN comments c ON a.id = c.article_id
      GROUP BY a.id
      ORDER BY a.date DESC
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu bài viết' });
  }
};

// Lấy chi tiết bài viết theo ID
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [article] = await pool.query(`
      SELECT 
        a.*, 
        COALESCE(AVG(r.rating), 0) AS averageRating,
        COUNT(DISTINCT r.id) AS totalRatings,
        COUNT(DISTINCT c.id) AS commentCount
      FROM articles a
      LEFT JOIN ratings r ON a.id = r.article_id
      LEFT JOIN comments c ON a.id = c.article_id
      WHERE a.id = ?
      GROUP BY a.id
    `, [id]);
    
    if (article.length === 0) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
    
    res.status(200).json(article[0]);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết bài viết' });
  }
};

// Thêm bài viết mới
exports.createArticle = async (req, res) => {
  try {
    const { title, category, summary, content, image, author } = req.body;
    
    if (!title || !category || !summary || !content || !image || !author) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    const [result] = await pool.query(`
      INSERT INTO articles (title, category, summary, content, image, author, date)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [title, category, summary, content, image, author]);
    
    const newArticleId = result.insertId;
    
    const [newArticle] = await pool.query('SELECT * FROM articles WHERE id = ?', [newArticleId]);
    
    res.status(201).json(newArticle[0]);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Lỗi khi tạo bài viết mới' });
  }
};

// Cập nhật bài viết
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, summary, content, image, author } = req.body;
    
    if (!title || !category || !summary || !content || !image || !author) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    const [result] = await pool.query(`
      UPDATE articles
      SET title = ?, category = ?, summary = ?, content = ?, image = ?, author = ?
      WHERE id = ?
    `, [title, category, summary, content, image, author, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
    
    const [updatedArticle] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);
    
    res.status(200).json(updatedArticle[0]);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật bài viết' });
  }
};

// Xóa bài viết
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Xóa các đánh giá và bình luận liên quan
    await pool.query('DELETE FROM ratings WHERE article_id = ?', [id]);
    await pool.query('DELETE FROM comments WHERE article_id = ?', [id]);
    
    // Xóa bài viết
    const [result] = await pool.query('DELETE FROM articles WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
    
    res.status(200).json({ message: 'Xóa bài viết thành công' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: 'Lỗi khi xóa bài viết' });
  }
};

// Thêm đánh giá cho bài viết
exports.addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, user_id } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Đánh giá không hợp lệ (1-5)' });
    }
    
    // Kiểm tra bài viết tồn tại
    const [article] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);
    
    if (article.length === 0) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
    
    // Thêm đánh giá mới
    await pool.query(`
      INSERT INTO ratings (article_id, user_id, rating, date)
      VALUES (?, ?, ?, NOW())
    `, [id, user_id || 0, rating]);
    
    // Lấy đánh giá trung bình mới
    const [ratingResult] = await pool.query(`
      SELECT AVG(rating) AS averageRating, COUNT(*) AS totalRatings
      FROM ratings
      WHERE article_id = ?
    `, [id]);
    
    res.status(200).json({
      averageRating: ratingResult[0].averageRating,
      totalRatings: ratingResult[0].totalRatings
    });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ message: 'Lỗi khi thêm đánh giá' });
  }
};

// Lấy các bài viết liên quan
exports.getRelatedArticles = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy danh mục của bài viết
    const [article] = await pool.query('SELECT category FROM articles WHERE id = ?', [id]);
    
    if (article.length === 0) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
    
    const category = article[0].category;
    
    // Lấy các bài viết cùng danh mục, trừ bài viết hiện tại
    const [relatedArticles] = await pool.query(`
      SELECT * FROM articles
      WHERE category = ? AND id != ?
      ORDER BY date DESC
      LIMIT 3
    `, [category, id]);
    
    // Nếu không đủ 3 bài viết, lấy thêm bài viết khác
    if (relatedArticles.length < 3) {
      const [additionalArticles] = await pool.query(`
        SELECT * FROM articles
        WHERE category != ? AND id != ?
        ORDER BY date DESC
        LIMIT ?
      `, [category, id, 3 - relatedArticles.length]);
      
      relatedArticles.push(...additionalArticles);
    }
    
    res.status(200).json(relatedArticles);
  } catch (error) {
    console.error('Error fetching related articles:', error);
    res.status(500).json({ message: 'Lỗi khi lấy bài viết liên quan' });
  }
};