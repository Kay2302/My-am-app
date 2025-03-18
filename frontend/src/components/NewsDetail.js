// src/components/NewsDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Form, Button, Alert, ListGroup, Spinner } from 'react-bootstrap';
import { FaStar, FaRegStar, FaUser, FaCalendarAlt, FaArrowLeft, FaComment } from 'react-icons/fa';
import Nav from './Nav';
import Footer from './Footer';
import { articleApi, commentApi } from '../services/api';

function NewsDetail() {
  const { id } = useParams();
  const articleId = parseInt(id, 10);
  const navigate = useNavigate();
  
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
    comment: '',
    rating: 0
  });
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Lấy dữ liệu bài viết, bình luận và bài viết liên quan
  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        setLoading(true);
        
        // Lấy chi tiết bài viết
        const articleResponse = await articleApi.getById(articleId);
        setArticle(articleResponse.data);
        
        // Lấy các bài viết liên quan
        const relatedResponse = await articleApi.getRelated(articleId);
        setRelatedArticles(relatedResponse.data);
        
        // Lấy bình luận của bài viết
        const commentsResponse = await commentApi.getByArticleId(articleId);
        setComments(commentsResponse.data);
        
        } catch (err) {
          console.error('Error fetching article data:', err);
          setError('Không thể tải dữ liệu bài viết. Vui lòng thử lại sau.');
        } finally {
          setLoading(false);
      }
    };
          fetchArticleData();

          // Cuộn lên đầu trang
          window.scrollTo(0, 0);
      }, [articleId]);

          // Xử lý hover đánh giá sao
          const handleRatingHover = (rating) => {
          setHoveredRating(rating);
      };

          // Xử lý rời chuột khỏi đánh giá sao
          const handleRatingLeave = () => {
          setHoveredRating(0);
      };

          // Xử lý đánh giá sao
          const handleRatingClick = async (rating) => {
          try {
          setUserRating(rating);
          setNewComment({
            ...newComment,
            rating: rating
      });

          // Gửi đánh giá lên server
          const response = await articleApi.addRating(articleId, { rating });

          // Cập nhật đánh giá trung bình cho bài viết
          setArticle({
            ...article,
            averageRating: response.data.averageRating,
            totalRatings: response.data.totalRatings
          });
          } catch (err) {
          console.error('Error adding rating:', err);
          alert('Không thể thêm đánh giá. Vui lòng thử lại sau.');
        }
      };

          // Xử lý thay đổi form comment
          const handleCommentChange = (e) => {
          const { name, value } = e.target;
          setNewComment({
          ...newComment,
          [name]: value
        });
      };

          // Xử lý gửi comment
          const handleCommentSubmit = async (e) => {
          e.preventDefault();

          // Kiểm tra dữ liệu
          const { name, email, comment, rating } = newComment;

          if (!name || !email || !comment) {
          alert('Vui lòng nhập đầy đủ thông tin!');
          return;
      }

          try {
          // Gửi bình luận lên server
          const response = await commentApi.add(articleId, newComment);

          // Thêm bình luận mới vào danh sách
          setComments([response.data, ...comments]);

          // Cập nhật số lượng bình luận cho bài viết
          setArticle({
            ...article,
            commentCount: (article.commentCount || 0) + 1
      });

          // Reset form
          setNewComment({
            name: '',
            email: '',
            comment: '',
            rating: 0
      });
          setUserRating(0);

          // Hiển thị thông báo thành công
          setCommentSuccess(true);

          // Ẩn thông báo sau 3 giây
          setTimeout(() => {
            setCommentSuccess(false);
          }, 3000);
          } catch (err) {
          console.error('Error adding comment:', err);
          alert('Không thể thêm bình luận. Vui lòng thử lại sau.');
        }
      };

          // Render đánh giá sao
          const renderStars = (count = 5, interactive = true) => {
          const rating = interactive 
          ? (hoveredRating || userRating || 0) 
          : count;

          return Array(5).fill(0).map((_, index) => {
          const starValue = index + 1;

if (interactive) {
  return (
    <span 
      key={index}
      className="star-rating"
      onMouseEnter={() => handleRatingHover(starValue)}
      onMouseLeave={() => handleRatingLeave()}
      onClick={() => handleRatingClick(starValue)}
      style={{ cursor: 'pointer', color: starValue <= rating ? '#ffc107' : '#e4e5e9', fontSize: '1.5rem', marginRight: '5px' }}
    >
      {starValue <= rating ? <FaStar /> : <FaRegStar />}
    </span>
  );
} else {
  return (
    <span 
      key={index}
      style={{ color: index < rating ? '#ffc107' : '#e4e5e9', fontSize: '1rem', marginRight: '2px' }}
    >
      {index < rating ? <FaStar /> : <FaRegStar />}
    </span>
  );
}
});
};

// Nếu đang tải dữ liệu
if (loading) {
return (
<>
  <Nav />
  <Container className="py-5 my-5 text-center">
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Đang tải...</span>
    </Spinner>
    <p className="mt-3">Vui lòng đợi trong giây lát.</p>
  </Container>
  <Footer />
</>
);
}

// Nếu có lỗi hoặc không tìm thấy bài viết
if (error || !article) {
return (
<>
  <Nav />
  <Container className="py-5 my-5 text-center">
    <h2>Không tìm thấy bài viết</h2>
    <p>{error || 'Bài viết bạn đang tìm không tồn tại hoặc đã bị xóa.'}</p>
    <Link to="/" className="btn btn-primary mt-3">
      <FaArrowLeft className="me-2" /> Quay lại trang chủ
    </Link>
  </Container>
  <Footer />
</>
);
}

return (
<>
<Nav />
<section className="page-section article-detail">
  <Container className="px-4 px-lg-5 mt-5 pt-4">
    {/* Breadcrumb */}
    <div className="mb-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
          <li className="breadcrumb-item"><Link to="/#tin-tuc">Tin tức</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{article.title}</li>
        </ol>
      </nav>
    </div>
    
    <Row>
      <Col lg={8}>
        {/* Bài viết chính */}
        <article className="mb-5">
          <h1 className="fw-bold mb-3">{article.title}</h1>
          
          <div className="d-flex align-items-center mb-4">
            <Badge bg="primary" className="me-2">{article.category}</Badge>
            <small className="text-muted me-3">
              <FaCalendarAlt className="me-1" /> {new Date(article.date).toLocaleDateString()}
            </small>
            <small className="text-muted me-3">
              <FaUser className="me-1" /> {article.author}
            </small>
            <div className="d-flex align-items-center ms-auto">
              {renderStars(Math.round(article.averageRating || 0), false)}
              <small className="text-muted ms-2">
                ({parseFloat(article.averageRating || 0).toFixed(1)}/5, {article.totalRatings || 0} đánh giá)
              </small>
            </div>
          </div>
          
          <img 
            className="img-fluid rounded mb-4" 
            src={article.image} 
            alt={article.title} 
            style={{width: '100%', maxHeight: '500px', objectFit: 'cover'}}
          />
          
          <div className="article-content mb-5" dangerouslySetInnerHTML={{ __html: article.content }}></div>
          
          {/* Phần chia sẻ */}
          <div className="d-flex justify-content-between align-items-center border-top border-bottom py-3 mb-5">
            <div>
              <strong>Chia sẻ:</strong>
              <a href="#!" className="text-primary ms-2 fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#!" className="text-info ms-2 fs-5"><i className="bi bi-twitter"></i></a>
              <a href="#!" className="text-danger ms-2 fs-5"><i className="bi bi-pinterest"></i></a>
              <a href="#!" className="text-primary ms-2 fs-5"><i className="bi bi-linkedin"></i></a>
            </div>
            <div>
              <span className="text-muted">
                <FaComment className="me-1" /> {comments.length} bình luận
              </span>
            </div>
          </div>
        </article>
        
        {/* Phần đánh giá và bình luận */}
        <div className="comments-section">
          <h3 className="mb-4">Đánh giá & Bình luận</h3>
          
          {/* Form đánh giá và bình luận */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-3">Viết đánh giá của bạn</h5>
              
              {commentSuccess && (
                <Alert variant="success" className="mb-3">
                  Cảm ơn bạn đã gửi bình luận! Bình luận của bạn đã được đăng.
                </Alert>
              )}
              
              <Form onSubmit={handleCommentSubmit}>
                <div className="mb-3">
                  <label className="form-label">Đánh giá</label>
                  <div className="d-flex align-items-center">
                    {renderStars(5, true)}
                    <span className="ms-2">
                      {userRating ? `${userRating}/5` : 'Chưa đánh giá'}
                    </span>
                  </div>
                </div>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên của bạn *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={newComment.name}
                        onChange={handleCommentChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={newComment.email}
                        onChange={handleCommentChange}
                        required
                      />
                      <Form.Text className="text-muted">
                        Email của bạn sẽ không được hiển thị công khai
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Bình luận *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="comment"
                    value={newComment.comment}
                    onChange={handleCommentChange}
                    placeholder="Nhập bình luận của bạn..."
                    required
                  />
                </Form.Group>
                
                <Button variant="primary" type="submit">
                  Gửi bình luận
                </Button>
              </Form>
            </Card.Body>
          </Card>
          
          {/* Danh sách bình luận */}
          <h5 className="mb-3">{comments.length} Bình luận</h5>
          
          <ListGroup className="mb-5">
            {comments.length > 0 ? (
              comments.map(comment => (
                <ListGroup.Item key={comment.id} className="border-0 border-bottom py-4">
                  <div className="d-flex">
                    <div className="comment-avatar me-3">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">{comment.name}</h6>
                        <small className="text-muted">{new Date(comment.date).toLocaleDateString()}</small>
                      </div>
                      <div className="mb-2">
                        {Array(5).fill(0).map((_, index) => (
                          <span key={index} style={{ color: index < comment.rating ? '#ffc107' : '#e4e5e9' }}>
                            {index < comment.rating ? <FaStar /> : <FaRegStar />}
                          </span>
                        ))}
                      </div>
                      <p className="mb-0">{comment.comment}</p>
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted mb-0">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
              </div>
            )}
          </ListGroup>
        </div>
      </Col>
      
      <Col lg={4}>
        {/* Sidebar */}
        <div className="position-sticky" style={{ top: '100px' }}>
          {/* Tác giả */}
          <Card className="mb-4 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="card-title">Về tác giả</h5>
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                {article.author.charAt(0).toUpperCase()}
              </div>
              <h6>{article.author}</h6>
              <p className="text-muted small">Tác giả có nhiều bài viết về chủ đề {article.category.toLowerCase()}.</p>
              <Button variant="outline-primary" size="sm">Xem tất cả bài viết</Button>
            </Card.Body>
          </Card>
          
          {/* Danh mục */}
          <Card className="mb-4 shadow-sm">
            <Card.Header>Danh mục</Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-6">
                  <ul className="list-unstyled mb-0">
                    <li><a href="#!">Tin Mới</a></li>
                    <li><a href="#!">Sự Kiện</a></li>
                    <li><a href="#!">Công Nghệ</a></li>
                  </ul>
                </div>
                <div className="col-6">
                  <ul className="list-unstyled mb-0">
                    <li><a href="#!">Giáo Dục</a></li>
                    <li><a href="#!">Kinh Tế</a></li>
                    <li><a href="#!">Thể Thao</a></li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          {/* Bài viết liên quan */}
          <Card className="shadow-sm">
            <Card.Header>Bài viết liên quan</Card.Header>
            <ListGroup variant="flush">
              {relatedArticles.map(relatedArticle => (
                <ListGroup.Item key={relatedArticle.id}>
                  <Row className="g-0">
                    <Col xs={4}>
                      <img 
                        src={relatedArticle.image} 
                        alt={relatedArticle.title} 
                        className="img-fluid rounded"
                        style={{ height: '60px', objectFit: 'cover' }}
                      />
                    </Col>
                    <Col xs={8} className="ps-3">
                      <div className="d-flex flex-column h-100">
                        <h6 className="mb-1 small fw-bold">
                          <Link to={`/tin-tuc/${relatedArticle.id}`} className="text-decoration-none text-dark">
                            {relatedArticle.title}
                          </Link>
                        </h6>
                        <small className="text-muted mt-auto">{new Date(relatedArticle.date).toLocaleDateString()}</small>
                      </div>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </div>
      </Col>
    </Row>
  </Container>
</section>
<Footer />
</>
);
}

export default NewsDetail;