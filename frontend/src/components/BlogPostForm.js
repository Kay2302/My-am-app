// src/components/BlogPostForm.js
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col, Spinner } from 'react-bootstrap';
import { articleApi } from '../services/api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaImage, FaTag, FaUser, FaPen, FaExclamationCircle, FaHome, FaInfoCircle, FaSave } from 'react-icons/fa';
import Nav from './Nav';
import Footer from './Footer';

function BlogPostForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    summary: '',
    content: '',
    image: '',
    author: localStorage.getItem('username') || ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const isLoggedIn = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();
  
  // Danh sách các danh mục
  const categories = [
    "Tin Mới", "Sự Kiện", "Công Nghệ", "Giáo Dục", "Kinh Tế", "Thể Thao", "Văn Hóa", "Du Lịch"
  ];
  useEffect(() => {
    // Kiểm tra đăng nhập
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      // Lưu URL hiện tại để chuyển hướng lại sau khi đăng nhập
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [navigate, location]);

  // Tự động cuộn lên đầu trang khi component được mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Tạo sessionId cho người dùng chưa đăng nhập
  useEffect(() => {
    if (!isLoggedIn && !sessionStorage.getItem('guestSessionId')) {
      const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('guestSessionId', sessionId);
    }
  }, [isLoggedIn]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Xóa lỗi khi người dùng bắt đầu sửa
    if (errors[name]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[name];
      setErrors(updatedErrors);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Tiêu đề quá ngắn (tối thiểu 10 ký tự)';
    }
    
    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }
    
    if (!formData.summary.trim()) {
      newErrors.summary = 'Vui lòng nhập tóm tắt';
    } else if (formData.summary.length < 30) {
      newErrors.summary = 'Tóm tắt quá ngắn (tối thiểu 30 ký tự)';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung';
    } else if (formData.content.length < 100) {
      newErrors.content = 'Nội dung quá ngắn (tối thiểu 100 ký tự)';
    }
    
    if (!formData.image.trim()) {
      newErrors.image = 'Vui lòng nhập đường dẫn hình ảnh';
    } else {
      if (formData.image.startsWith('http://') || formData.image.startsWith('https://')) {
        try {
          new URL(formData.image);
        } catch (e) {
          newErrors.image = 'Đường dẫn hình ảnh không hợp lệ';
        }
      } 
      else if (!formData.image.startsWith('/assets/')) {
        newErrors.image = 'Đường dẫn hình ảnh phải bắt đầu bằng /assets/ hoặc là URL đầy đủ';
      }
    }
    
    if (!formData.author.trim()) {
      newErrors.author = 'Vui lòng nhập tên tác giả';
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra lỗi
    const formErrors = validateForm();
    console.log("Form validation errors:", formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      window.scrollTo(0, 0);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      console.log("Submitting form data:", formData);
      
      // Thêm trạng thái 'pending' cho bài viết mới
      const postData = {
        ...formData,
        status: 'pending',
        date: new Date().toISOString()
      };
      
      // Thêm sessionId nếu người dùng chưa đăng nhập
      if (!isLoggedIn) {
        postData.sessionId = sessionStorage.getItem('guestSessionId');
      }
      
      const response = await articleApi.create(postData);
      console.log("API response:", response);
      
      setSubmitSuccess(true);
      setFormData({
        title: '',
        category: '',
        summary: '',
        content: '',
        image: '',
        author: localStorage.getItem('username') || ''
      });
      
      // Cuộn lên đầu trang
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error submitting post:', error);
      setSubmitError('Đã xảy ra lỗi khi gửi bài viết. Vui lòng thử lại sau.');
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Chuyển đổi chế độ xem trước
  const togglePreview = () => {
    // Nếu đang trong chế độ xem trước và có lỗi, hiển thị lỗi
    if (showPreview) {
      setShowPreview(false);
    } else {
      const formErrors = validateForm();
      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        window.scrollTo(0, 0);
      } else {
        setShowPreview(true);
        window.scrollTo(0, 0);
      }
    }
  };
  
  return (
    <>
      <Nav />
      <Container className="py-5 mt-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/"><FaHome /> Trang chủ</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Đăng bài viết</li>
              </ol>
            </nav>
            
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <h2 className="text-center mb-4">Đăng bài viết mới</h2>
                
                {!isLoggedIn && (
                  <Alert variant="info" className="mb-4">
                    <FaInfoCircle className="me-2" />
                    Bạn đang đăng bài với tư cách khách. Bài viết sẽ được kiểm duyệt trước khi xuất bản.
                    Để quản lý bài viết tốt hơn, vui lòng <Link to="/login">đăng nhập</Link>.
                  </Alert>
                )}
                
                {submitSuccess && (
                  <Alert variant="success">
                    <div className="text-center">
                      <div className="success-checkmark">
                        <div className="check-icon">
                          <span className="icon-line line-tip"></span>
                          <span className="icon-line line-long"></span>
                          <div className="icon-circle"></div>
                          <div className="icon-fix"></div>
                        </div>
                      </div>
                      <h5>Gửi bài viết thành công!</h5>
                      <p>Bài viết của bạn đã được gửi và đang chờ phê duyệt từ quản trị viên.</p>
                      <p>Bài viết sẽ được hiển thị công khai sau khi được phê duyệt.</p>
                      
                      <div className="mt-4">
                        {isLoggedIn ? (
                          <>
                            <p>Bạn có thể theo dõi trạng thái bài viết trong phần "Bài viết của tôi".</p>
                            <Button 
                              variant="primary" 
                              className="me-2" 
                              onClick={() => navigate('/my-posts')}
                            >
                              Xem bài viết của tôi
                            </Button>
                          </>
                        ) : (
                          <>
                            <p>Bạn có thể quay lại trang chủ hoặc đăng bài viết mới.</p>
                          </>
                        )}
                        <Button 
                          variant="outline-primary" 
                          onClick={() => {
                            setSubmitSuccess(false);
                            setShowPreview(false);
                          }}
                        >
                          Đăng bài viết mới
                        </Button>
                      </div>
                    </div>
                  </Alert>
                )}
                
                {submitError && (
                  <Alert variant="danger">
                    <FaExclamationCircle className="me-2" />
                    {submitError}
                  </Alert>
                )}
                
                {Object.keys(errors).length > 0 && (
                  <Alert variant="danger">
                    <h5>Vui lòng sửa các lỗi sau:</h5>
                    <ul className="mb-0">
                      {Object.values(errors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </Alert>
                )}
                
                {!submitSuccess && !showPreview && (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaPen className="me-2" />
                        Tiêu đề
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        isInvalid={!!errors.title}
                        placeholder="Nhập tiêu đề bài viết"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.title}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Tiêu đề nên ngắn gọn, hấp dẫn và mô tả được nội dung bài viết (tối thiểu 10 ký tự)
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaTag className="me-2" />
                        Danh mục
                      </Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        isInvalid={!!errors.category}
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>
                            {category}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.category}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Tóm tắt</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="summary"
                        value={formData.summary}
                        onChange={handleChange}
                        isInvalid={!!errors.summary}
                        placeholder="Nhập tóm tắt nội dung bài viết"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.summary}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Tóm tắt ngắn gọn nội dung chính của bài viết (tối thiểu 30 ký tự)
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Nội dung</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={10}
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        isInvalid={!!errors.content}
                        placeholder="Nhập nội dung đầy đủ của bài viết"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.content}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Bạn có thể sử dụng HTML cơ bản để định dạng bài viết (thẻ p, h2, h3, strong, em, ul, li, a...). 
                        Nội dung cần tối thiểu 100 ký tự.
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaImage className="me-2" />
                        Đường dẫn hình ảnh
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        isInvalid={!!errors.image}
                        placeholder="Nhập đường dẫn hình ảnh đại diện cho bài viết"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.image}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Nhập đường dẫn hình ảnh (ví dụ: /assets/img/portfolio/thumbnails/1.jpg) hoặc URL đầy đủ
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>
                        <FaUser className="me-2" />
                        Tác giả
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        isInvalid={!!errors.author}
                        placeholder="Nhập tên tác giả"
                        readOnly={isLoggedIn}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.author}
                      </Form.Control.Feedback>
                      {isLoggedIn ? (
                        <Form.Text className="text-muted">
                          Bài viết sẽ được đăng với tên người dùng của bạn
                        </Form.Text>
                      ) : (
                        <Form.Text className="text-muted">
                          Nhập tên của bạn để hiển thị cùng bài viết
                        </Form.Text>
                      )}
                    </Form.Group>
                    
                    <div className="d-grid gap-2">
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          className="w-50"
                          onClick={togglePreview}
                        >
                          Xem trước
                        </Button>
                        <Button 
                          type="submit" 
                          variant="primary" 
                          className="w-50"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Đang gửi...
                            </>
                          ) : (
                            <>
                              <FaSave className="me-2" /> Gửi bài viết
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => navigate('/')}
                      >
                        Hủy và quay lại
                      </Button>
                    </div>
                    
                    <Alert variant="warning" className="mt-4">
                      <FaInfoCircle className="me-2" />
                      <strong>Lưu ý:</strong> Bài viết sẽ được kiểm duyệt trước khi xuất bản. Quá trình này có thể mất từ 24-48 giờ.
                    </Alert>
                  </Form>
                )}
                
                {!submitSuccess && showPreview && (
                  <div className="article-preview">
                    <Alert variant="info" className="mb-4">
                      <FaInfoCircle className="me-2" />
                      <strong>Chế độ xem trước:</strong> Đây là cách bài viết của bạn sẽ hiển thị sau khi được phê duyệt.
                    </Alert>
                    
                    <h3 className="mb-3">{formData.title || "Tiêu đề bài viết"}</h3>
                    
                    <div className="d-flex align-items-center mb-3">
                      <span className="badge bg-primary me-2">{formData.category || "Danh mục"}</span>
                      <small className="text-muted me-3">
                        <FaUser className="me-1" /> {formData.author || "Tác giả"}
                      </small>
                    </div>
                    
                    {formData.image && (
                      <img 
                        src={formData.image} 
                        alt={formData.title} 
                        className="img-fluid rounded mb-3" 
                        style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/img/placeholder.jpg';
                          e.target.alt = 'Ảnh không khả dụng';
                        }}
                      />
                    )}
                    
                    <div className="mb-4">
                      <h5 className="mb-2">Tóm tắt:</h5>
                      <p>{formData.summary || "Tóm tắt nội dung bài viết"}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="mb-2">Nội dung:</h5>
                      <div dangerouslySetInnerHTML={{ __html: formData.content || "<p>Nội dung bài viết</p>" }}></div>
                    </div>
                    
                    <div className="d-flex gap-2 mt-4">
                      <Button 
                        variant="outline-secondary" 
                        className="w-50"
                        onClick={togglePreview}
                      >
                        Trở lại chỉnh sửa
                      </Button>
                      <Button 
                        variant="primary" 
                        className="w-50"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <FaSave className="me-2" /> Gửi bài viết
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}

export default BlogPostForm;