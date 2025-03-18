// src/components/News.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { FaStar, FaRegStar, FaUser, FaCalendarAlt, FaComment } from 'react-icons/fa';

function News({ articles = [], loading = false, error = null }) {
  // Render đánh giá sao
  const renderStars = (rating, size = '1rem') => {
    const roundedRating = Math.round(rating || 0);
    return Array(5).fill(0).map((_, index) => (
      <span 
        key={index}
        style={{ color: index < roundedRating ? '#ffc107' : '#e4e5e9', fontSize: size, marginRight: '2px' }}
      >
        {index < roundedRating ? <FaStar /> : <FaRegStar />}
      </span>
    ));
  };

  // Sắp xếp bài viết theo ngày giảm dần (mới nhất trước)
  const sortedArticles = [...articles]
    .filter(article => article.status === 'approved') // Chỉ lấy bài viết đã được phê duyệt
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sắp xếp theo ngày mới nhất

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <section className="page-section" id="tin-tuc">
        <div className="container px-4 px-lg-5 text-center">
          <h2 className="text-center mt-0">Tin Tức Mới Nhất</h2>
          <hr className="divider" />
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      </section>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <section className="page-section" id="tin-tuc">
        <div className="container px-4 px-lg-5 text-center">
          <h2 className="text-center mt-0">Tin Tức Mới Nhất</h2>
          <hr className="divider" />
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </section>
    );
  }

  // Hiển thị khi không có bài viết
  if (sortedArticles.length === 0) {
    return (
      <section className="page-section" id="tin-tuc">
        <div className="container px-4 px-lg-5 text-center">
          <h2 className="text-center mt-0">Tin Tức Mới Nhất</h2>
          <hr className="divider" />
          <div className="alert alert-info" role="alert">
            Hiện tại chưa có bài viết nào. Vui lòng quay lại sau.
          </div>
        </div>
      </section>
    );
  }

  // Chỉ hiển thị tối đa 6 bài viết trong trang chủ
  const displayedArticles = sortedArticles.slice(0, 6);

  return (
    <section className="page-section" id="tin-tuc">
      <div className="container px-4 px-lg-5">
        <h2 className="text-center mt-0">Tin Tức Mới Nhất</h2>
        <hr className="divider" />
        
        <Row className="g-4">
          {displayedArticles.map((article, index) => (
            <Col lg={4} md={6} key={article.id}>
              <Card className={`h-100 shadow-sm hover-scale ${index < 3 ? 'featured-article' : ''}`}>
                <div className="position-relative">
                  <Card.Img 
                    variant="top" 
                    src={article.image} 
                    alt={article.title} 
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/img/placeholder.jpg';
                      e.target.alt = 'Ảnh không khả dụng';
                    }}
                  />
                  <Badge 
                    bg="primary" 
                    className="position-absolute top-0 end-0 m-2 px-2 py-1"
                  >
                    {article.category}
                  </Badge>
                  {index < 3 && (
                    <Badge 
                      bg="danger" 
                      className="position-absolute top-0 start-0 m-2 px-2 py-1"
                    >
                      Mới
                    </Badge>
                  )}
                </div>
                
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">
                      <FaCalendarAlt className="me-1" /> {new Date(article.date).toLocaleDateString()}
                    </small>
                    <small className="text-muted">
                      <FaUser className="me-1" /> {article.author}
                    </small>
                  </div>
                  
                  <Card.Title>
                    <Link to={`/tin-tuc/${article.id}`} className="text-decoration-none text-dark">
                      {article.title}
                    </Link>
                  </Card.Title>
                  
                  <Card.Text>
                    {article.summary.length > 120 
                      ? `${article.summary.substring(0, 120)}...` 
                      : article.summary
                    }
                  </Card.Text>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      {renderStars(article.averageRating)}
                      <small className="text-muted ms-2">
                        ({parseFloat(article.averageRating || 0).toFixed(1)}/5)
                      </small>
                    </div>
                    <small className="text-muted">
                      <FaComment className="me-1" /> {article.commentCount || 0} bình luận
                    </small>
                  </div>
                  
                  <Link to={`/tin-tuc/${article.id}`} className="btn btn-primary btn-sm w-100">
                    Đọc thêm
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        
        <div className="text-center mt-5">
          <Link to="/tin-tuc" className="btn btn-primary btn-xl">Xem Tất Cả Tin Tức</Link>
        </div>
      </div>
    </section>
  );
}

export default News;