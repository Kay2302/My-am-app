import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert, Modal } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaHome, FaSignOutAlt } from 'react-icons/fa';

function Login({ onLogin }) {
  // Lưu trữ thông tin đăng nhập trong state
  const [credentials, setCredentials] = useState({
    admin: { username: 'admin', password: 'admin123', role: 'admin' },
    user: { username: 'user', password: 'user123', role: 'user' },
    user2: { username: 'user2', password: 'user2123', role: 'user' }
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // State cho phần quên mật khẩu
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [newPasswordGenerated, setNewPasswordGenerated] = useState(false);
  const [newRandomPassword, setNewRandomPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  
  const navigate = useNavigate();

  // Hiệu ứng typing cho tiêu đề
  const [typedText, setTypedText] = useState('');
  const fullText = 'Hệ Thống Quản Trị';
  
  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [typedText]);

  // Kiểm tra xem người dùng đã đăng nhập chưa
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    if (isAuthenticated) {
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/my-posts');
      }
    }
    
    // Lấy username đã lưu (nếu có)
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, [navigate]);

  // Xử lý đăng nhập
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Lưu username nếu chọn "Remember me"
    if (rememberMe) {
      localStorage.setItem('rememberedUsername', username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }

    // Giả lập API delay
    setTimeout(() => {
      // Kiểm tra thông tin đăng nhập
      if (username === credentials.admin.username && password === credentials.admin.password) {
        // Đăng nhập admin thành công
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('userRole', 'admin');
        onLogin();
        navigate('/admin');
      } 
      else if (username === credentials.user.username && password === credentials.user.password) {
        // Đăng nhập user thành công
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('userRole', 'user');
        onLogin();
        navigate('/my-posts');
      }
      else if (username === credentials.user2.username && password === credentials.user2.password) {
        // Đăng nhập user2 thành công
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('userRole', 'user');
        onLogin();
        navigate('/my-posts');
      }
      else {
        // Đăng nhập thất bại
        setError('Tên đăng nhập hoặc mật khẩu không đúng!');
        setLoading(false);
      }
    }, 1000);
  };

  // Tạo mật khẩu ngẫu nhiên 6 số
  const generateRandomPassword = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Xử lý quên mật khẩu - Tạo mật khẩu mới 6 số
  const handleResetPassword = (e) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);

    // Kiểm tra tên đăng nhập
    if (!forgotUsername) {
      setResetError('Vui lòng nhập tên đăng nhập!');
      setResetLoading(false);
      return;
    }

    // Giả lập kiểm tra tên đăng nhập tồn tại
    setTimeout(() => {
      const userExists = 
        forgotUsername === credentials.admin.username ||
        forgotUsername === credentials.user.username ||
        forgotUsername === credentials.user2.username;
        
      if (userExists) {
        // Tạo mật khẩu mới 6 số
        const randomPassword = generateRandomPassword();
        setNewRandomPassword(randomPassword);
        
        // Cập nhật mật khẩu mới vào credentials
        if (forgotUsername === credentials.admin.username) {
          setCredentials({
            ...credentials,
            admin: { ...credentials.admin, password: randomPassword }
          });
        } else if (forgotUsername === credentials.user.username) {
          setCredentials({
            ...credentials,
            user: { ...credentials.user, password: randomPassword }
          });
        } else {
          setCredentials({
            ...credentials,
            user2: { ...credentials.user2, password: randomPassword }
          });
        }
        
        setNewPasswordGenerated(true);
        console.log(`Mật khẩu mới cho ${forgotUsername}: ${randomPassword}`);
      } else {
        setResetError('Tên đăng nhập không tồn tại trong hệ thống!');
      }
      setResetLoading(false);
    }, 1000);
  };

  // Reset form khi đóng modal
  const handleCloseModal = () => {
    setShowForgotPassword(false);
    setForgotUsername('');
    setNewPasswordGenerated(false);
    setNewRandomPassword('');
    setResetError('');
  };

  // Đóng modal và tự động điền username để đăng nhập
  const handleUseNewPassword = () => {
    setUsername(forgotUsername);
    setPassword(''); // Xóa mật khẩu để người dùng nhập mật khẩu mới
    handleCloseModal();
  };

  return (
    <div className="login-page">
      <div className="animated-background">
        <div className="cube"></div>
        <div className="cube"></div>
        <div className="cube"></div>
        <div className="cube"></div>
        <div className="cube"></div>
      </div>
      
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={6}>
            <div className="text-center mb-4 text-white">
              <h2 className="typing-effect">{typedText}<span className="cursor">|</span></h2>
              <p className="subtitle">Đăng nhập để tiếp tục quản lý hệ thống</p>
            </div>
            
            <Card className="login-card">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="brand-logo-container">
                  </div>
                  <h4 className="welcome-text">Chào mừng trở lại!</h4>
                </div>
                
                {error && (
                  <Alert variant="danger" className="animated-alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>Tên đăng nhập</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light">
                        <FaUser />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên đăng nhập"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="border-start-0 ps-0"
                      />
                    </InputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Mật khẩu</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light">
                        <FaLock />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-start-0 border-end-0 ps-0"
                      />
                      <InputGroup.Text 
                        className="bg-light cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                  
                  <Row className="mb-4">
                    <Col>
                      <Form.Check
                        type="checkbox"
                        id="rememberMe"
                        label="Ghi nhớ đăng nhập"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="custom-checkbox"
                      />
                    </Col>
                    <Col className="text-end">
                      <a 
                        href="#!" 
                        className="forgot-password"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowForgotPassword(true);
                        }}
                      >
                        Quên mật khẩu?
                      </a>
                    </Col>
                  </Row>
                  
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 login-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      'Đăng nhập'
                    )}
                  </Button>
                </Form>
                
                <div className="mt-4 text-center">
                  
                  
                  <Link to="/" className="btn btn-outline-secondary mt-3">
                    <FaSignOutAlt className="me-2" /> Trở về trang chủ
                  </Link>
                </div>
              </Card.Body>
            </Card>
            
            <div className="mt-4 text-center text-white">
              <p className="footer-text">
                &copy; {new Date().getFullYear()} Admin System. All rights reserved.
                <br />
                <small>Phiên bản 1.0.0</small>
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modal Quên Mật Khẩu với mật khẩu mới 6 số */}
      <Modal 
        show={showForgotPassword} 
        onHide={handleCloseModal}
        centered
        className="forgot-password-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Đặt lại mật khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {newPasswordGenerated ? (
            // Hiển thị mật khẩu mới 6 số
            <div className="text-center py-3">
              <div className="new-password-container">
                <h5>Mật khẩu mới của bạn</h5>
                <div className="new-password-code">{newRandomPassword}</div>
                <p className="text-muted">
                  Vui lòng ghi nhớ mật khẩu mới này và sử dụng để đăng nhập.
                </p>
              </div>
              
              <div className="d-grid gap-2 mt-4">
                <Button 
                  variant="primary" 
                  onClick={handleUseNewPassword}
                >
                  Đăng nhập với mật khẩu mới
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={handleCloseModal}
                >
                  Đóng
                </Button>
              </div>
            </div>
          ) : (
            // Hiển thị form nhập tên đăng nhập để lấy mật khẩu mới
            <Form onSubmit={handleResetPassword}>
              <p className="text-muted mb-4">
                Vui lòng nhập tên đăng nhập của bạn để lấy mật khẩu mới.
              </p>
              
              {resetError && (
                <Alert variant="danger" className="animated-alert">
                  {resetError}
                </Alert>
              )}
              
              <Form.Group className="mb-4">
                <Form.Label>Tên đăng nhập</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <FaUser />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên đăng nhập của bạn"
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    required
                    className="border-start-0 ps-0"
                  />
                </InputGroup>
              </Form.Group>
              
              <div className="d-grid">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    'Lấy mật khẩu mới'
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
      
    </div>
  );
}

export default Login;