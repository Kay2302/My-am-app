// src/components/MyPosts.js
import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Alert, Card, Row, Col, Tabs, Tab, Modal } from 'react-bootstrap';
import { FaEdit, FaTrash, FaUser, FaEye, FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { articleApi } from '../services/api';
import Nav from './Nav';
import Footer from './Footer';

function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPost, setPreviewPost] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const username = localStorage.getItem('username') || '';
  const isLoggedIn = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();

  
  useEffect(() => {
  // Kiểm tra đăng nhập
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    navigate('/login', { state: { from: location } });
  }
  }, [navigate, location]);

  useEffect(() => {
    // Nếu không đăng nhập, sử dụng thông tin từ session storage
    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        
        let userPosts = [];
        
        if (isLoggedIn) {
          // Nếu đã đăng nhập, lấy bài viết theo username
          const response = await articleApi.getAll();
          userPosts = response.data.filter(post => post.author === username);
        } else {
          // Nếu chưa đăng nhập, kiểm tra xem có sessionId không
          const sessionId = sessionStorage.getItem('guestSessionId');
          if (sessionId) {
            // Lấy bài viết theo sessionId
            const response = await articleApi.getAll();
            userPosts = response.data.filter(post => post.sessionId === sessionId);
          }
        }
        
        // Sắp xếp bài viết theo thời gian giảm dần (mới nhất lên đầu)
        userPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setPosts(userPosts);
        setError(null);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyPosts();
  }, [username, isLoggedIn]);
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <Badge bg="success"><FaCheckCircle className="me-1" /> Đã phê duyệt</Badge>;
      case 'rejected':
        return <Badge bg="danger"><FaTimesCircle className="me-1" /> Bị từ chối</Badge>;
      case 'pending':
      default:
        return <Badge bg="warning" text="dark"><FaClock className="me-1" /> Đang chờ duyệt</Badge>;
    }
  };
  
  const confirmDelete = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };
  
  const deletePost = async () => {
    if (!postToDelete) return;
    
    try {
      await articleApi.delete(postToDelete.id);
      setPosts(posts.filter(post => post.id !== postToDelete.id));
      setShowDeleteModal(false);
      setPostToDelete(null);
      
      // Hiển thị thông báo thành công
      setSuccessMessage('Xóa bài viết thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Không thể xóa bài viết. Vui lòng thử lại sau.');
    }
  };
  
  const previewArticle = (post) => {
    setPreviewPost(post);
    setShowPreviewModal(true);
  };
  
  // Lọc bài viết theo trạng thái
  const pendingPosts = posts.filter(post => post.status === 'pending' || !post.status);
  const approvedPosts = posts.filter(post => post.status === 'approved');
  const rejectedPosts = posts.filter(post => post.status === 'rejected');
  
  if (loading) {
    return (
      <>
        <Nav />
        <Container className="py-5 mt-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Đang tải bài viết...</p>
        </Container>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Nav />
      <Container className="py-5 mt-5">
        <Row className="mb-4">
          <Col>
            <h2 className="mb-4">Bài viết của tôi</h2>
            
            {error && (
              <Alert variant="danger">
                <FaExclamationTriangle className="me-2" />
                {error}
              </Alert>
            )}
            
            {successMessage && (
              <Alert variant="success">
                <FaCheckCircle className="me-2" />
                {successMessage}
              </Alert>
            )}
            
            {!isLoggedIn && (
              <Alert variant="info">
                <FaInfoCircle className="me-2" />
                Bạn đang xem bài viết với tư cách khách. Để quản lý bài viết tốt hơn, vui lòng 
                <Link to="/login" className="alert-link ms-1">đăng nhập</Link>.
              </Alert>
            )}
          </Col>
        </Row>
        
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Tổng số bài viết: {posts.length}</h5>
                  <p className="text-muted mb-0">Quản lý tất cả bài viết của bạn</p>
                </div>
                <Link to="/create-post" className="btn btn-primary">
                  Tạo bài viết mới
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Tabs defaultActiveKey="all" className="mb-4">
          <Tab eventKey="all" title={`Tất cả (${posts.length})`}>
            <RenderPostsTable 
              posts={posts} 
              confirmDelete={confirmDelete} 
              getStatusBadge={getStatusBadge} 
              previewArticle={previewArticle}
            />
          </Tab>
          <Tab eventKey="pending" title={`Chờ duyệt (${pendingPosts.length})`}>
            <RenderPostsTable 
              posts={pendingPosts} 
              confirmDelete={confirmDelete} 
              getStatusBadge={getStatusBadge} 
              previewArticle={previewArticle}
            />
          </Tab>
          <Tab eventKey="approved" title={`Đã duyệt (${approvedPosts.length})`}>
            <RenderPostsTable 
              posts={approvedPosts} 
              confirmDelete={confirmDelete} 
              getStatusBadge={getStatusBadge} 
              previewArticle={previewArticle}
            />
          </Tab>
          <Tab eventKey="rejected" title={`Bị từ chối (${rejectedPosts.length})`}>
            <RenderPostsTable 
              posts={rejectedPosts} 
              confirmDelete={confirmDelete} 
              getStatusBadge={getStatusBadge} 
              previewArticle={previewArticle}
            />
          </Tab>
        </Tabs>
        
        {/* Modal Xác nhận xóa */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận xóa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Bạn có chắc chắn muốn xóa bài viết <strong>{postToDelete?.title}</strong>?</p>
            <p className="text-danger">Hành động này không thể hoàn tác.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={deletePost}>
              Xóa bài viết
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Modal Xem trước bài viết */}
        <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Xem trước bài viết</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {previewPost && (
              <div className="article-preview">
                <h3 className="mb-3">{previewPost.title}</h3>
                
                <div className="d-flex align-items-center mb-3">
                  <Badge bg="primary" className="me-2">{previewPost.category}</Badge>
                  <small className="text-muted me-3">
                    <FaClock className="me-1" /> {new Date(previewPost.date).toLocaleDateString()}
                  </small>
                  <small className="text-muted">
                    <FaUser className="me-1" /> {previewPost.author}
                  </small>
                </div>
                
                <div className="mb-3">
                  {getStatusBadge(previewPost.status)}
                  {previewPost.status === 'rejected' && previewPost.rejectionReason && (
                    <Alert variant="danger" className="mt-2">
                      <strong>Lý do từ chối:</strong> {previewPost.rejectionReason}
                    </Alert>
                  )}
                </div>
                
                <img 
                  src={previewPost.image} 
                  alt={previewPost.title} 
                  className="img-fluid rounded mb-3" 
                  style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                />
                
                <h5 className="mb-3 fw-bold">Tóm tắt:</h5>
                <p>{previewPost.summary}</p>
                
                <h5 className="mb-3 fw-bold">Nội dung:</h5>
                <div dangerouslySetInnerHTML={{ __html: previewPost.content }}></div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
              Đóng
            </Button>
            {previewPost && previewPost.status === 'approved' && (
              <Link 
                to={`/tin-tuc/${previewPost.id}`} 
                className="btn btn-primary"
                onClick={() => setShowPreviewModal(false)}
              >
                Xem trang bài viết
              </Link>
            )}
            {previewPost && (previewPost.status === 'pending' || !previewPost.status) && (
              <Link 
                to={`/edit-post/${previewPost.id}`} 
                className="btn btn-warning"
                onClick={() => setShowPreviewModal(false)}
              >
                Chỉnh sửa bài viết
              </Link>
            )}
          </Modal.Footer>
        </Modal>
      </Container>
      <Footer />
    </>
  );
}

// Component con để hiển thị bảng bài viết
function RenderPostsTable({ posts, confirmDelete, getStatusBadge, previewArticle }) {
  if (posts.length === 0) {
    return (
      <Alert variant="info">
        <FaInfoCircle className="me-2" />
        Không có bài viết nào trong danh mục này.
      </Alert>
    );
  }
  
  return (
    <div className="table-responsive">
      <Table striped hover className="shadow-sm">
        <thead className="bg-light">
          <tr>
            <th>Tiêu đề</th>
            <th>Danh mục</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.id}>
              <td>
                <div className="fw-bold">{post.title}</div>
                {post.status === 'rejected' && post.rejectionReason && (
                  <small className="d-block text-danger mt-1">
                    <FaTimesCircle className="me-1" /> Lý do: {post.rejectionReason}
                  </small>
                )}
              </td>
              <td>{post.category}</td>
              <td>{new Date(post.date).toLocaleDateString()}</td>
              <td>{getStatusBadge(post.status)}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button 
                    variant="info" 
                    size="sm"
                    onClick={() => previewArticle(post)}
                  >
                    <FaEye className="me-1" /> Xem
                  </Button>
                  
                  {post.status === 'approved' && (
                    <Link to={`/tin-tuc/${post.id}`} className="btn btn-sm btn-primary">
                      <FaEye className="me-1" /> Xem trang
                    </Link>
                  )}
                  
                  {(post.status === 'pending' || post.status === 'rejected' || !post.status) && (
                    <Link to={`/edit-post/${post.id}`} className="btn btn-sm btn-warning">
                      <FaEdit className="me-1" /> Sửa
                    </Link>
                  )}
                  
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => confirmDelete(post)}
                  >
                    <FaTrash className="me-1" /> Xóa
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default MyPosts;