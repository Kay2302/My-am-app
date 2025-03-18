import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { articleApi } from '../services/api';
import { FaImage, FaTag, FaUser, FaPen, FaExclamationCircle } from 'react-icons/fa';
import Nav from './Nav';
import Footer from './Footer';

function EditBlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    summary: '',
    content: '',
    image: '',
    author: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Danh sách các danh mục
  const categories = [
    "Tin Mới", "Sự Kiện", "Công Nghệ", "Giáo Dục", "Kinh Tế", "Thể Thao", "Văn Hóa", "Du Lịch"
  ];
  
  // Lấy dữ liệu bài viết
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await articleApi.getById(id);
        
        if (!response.data) {
          setNotFound(true);
          return;
        }
        
        // Kiểm tra xem bài viết có phải của user hiện tại không
        const username = localStorage.getItem('username');
        if (response.data.author !== username) {
          setNotFound(true);
          return;
        }
        
        // Kiểm tra xem bài viết có thể chỉnh sửa không (chỉ được sửa bài chưa phê duyệt)
        if (response.data.status === 'approved') {
          setSubmitError('Bài viết đã được phê duyệt không thể chỉnh sửa.');
          return;
        }
        
        setFormData(response.data);
      } catch (err) {
        console.error('Error fetching article:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Xóa lỗi khi người dùng bắt đầu sửa
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    else if (formData.title.length < 10) newErrors.title = 'Tiêu đề quá ngắn (tối thiểu 10 ký tự)';
    
    if (!formData.category) newErrors.category = 'Vui lòng chọn danh mục';
    
    if (!formData.summary.trim()) newErrors.summary = 'Vui lòng nhập tóm tắt';
    else if (formData.summary.length < 10) newErrors.summary = 'Tóm tắt quá ngắn (tối thiểu 30 ký tự)';
    
    if (!formData.content.trim()) newErrors.content = 'Vui lòng nhập nội dung';
    else if (formData.content.length < 50) newErrors.content = 'Nội dung quá ngắn (tối thiểu 100 ký tự)';
    
    if (!formData.image.trim()) newErrors.image = 'Vui lòng nhập đường dẫn hình ảnh';
    
    if (!formData.author.trim()) newErrors.author = 'Vui lòng nhập tên tác giả';
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra lỗi
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      window.scrollTo(0, 0);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Cập nhật bài viết và đặt lại trạng thái 'pending'
      const postData = {
        ...formData,
        status: 'pending'
      };
      
      await articleApi.update(id, postData);
      
      setSubmitSuccess(true);
      
      // Cuộn lên đầu trang
      window.scrollTo(0, 0);
      
      // Chuyển hướng sau 3 giây
      setTimeout(() => {
        navigate('/my-posts');
      }, 3000);
      
    } catch (error) {
      console.error('Error updating post:', error);
      setSubmitError('Đã xảy ra lỗi khi cập nhật bài viết. Vui lòng thử lại sau.');
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <>
        <Nav />
        <Container className="py-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Đang tải dữ liệu bài viết...</p>
        </Container>
        <Footer />
      </>
    );
  }
  
  // Hiển thị thông báo nếu không tìm thấy bài viết
  if (notFound) {
    return (
      <>
        <Nav />
        <Container className="py-5 text-center">
          <Alert variant="warning">
            <h4>Không tìm thấy bài viết!</h4>
            <p>Bài viết không tồn tại hoặc bạn không có quyền chỉnh sửa.</p>
            <Button variant="primary" onClick={() => navigate('/my-posts')}>
              Quay lại danh sách bài viết
            </Button>
          </Alert>
        </Container>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Nav />
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <h2 className="text-center mb-4">Chỉnh sửa bài viết</h2>
                
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
                      <h5>Cập nhật bài viết thành công!</h5>
                      <p>Bài viết của bạn đã được cập nhật và đang chờ phê duyệt lại từ quản trị viên.</p>
                      <p>Bạn sẽ được chuyển hướng đến trang quản lý bài viết sau 3 giây...</p>
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
                
                {!submitSuccess && (
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
                        placeholder="Nhập URL hình ảnh đại diện cho bài viết"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.image}
                      </Form.Control.Feedback>
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
                        readOnly
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.author}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <div className="d-grid gap-2">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Đang cập nhật...
                          </>
                        ) : (
                          'Cập nhật bài viết'
                        )}
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => navigate('/my-posts')}
                      >
                        Hủy và quay lại
                      </Button>
                    </div>
                    
                    <div className="text-center mt-3">
                      <p className="text-muted">
                        Bài viết sẽ được kiểm duyệt lại trước khi xuất bản
                      </p>
                    </div>
                  </Form>
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

export default EditBlogPost;