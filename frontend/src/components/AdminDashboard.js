// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Button, Table, Badge, Modal, Form, Tabs, Tab, Alert, Spinner, Dropdown } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaStar, FaComment, FaSearch, FaEye, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaSignOutAlt, FaCalendarAlt, FaUser, FaFilter, FaNewspaper } from 'react-icons/fa';
import './AdminDashboard.css';
import { articleApi, commentApi } from '../services/api';

function AdminDashboard({ onLogout }) {
  const [articles, setArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedArticleForComments, setSelectedArticleForComments] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingArticles, setPendingArticles] = useState([]);
  const [viewPendingArticle, setViewPendingArticle] = useState(null);
  const [showPendingPreviewModal, setShowPendingPreviewModal] = useState(false);
  const [showArticlePreviewModal, setShowArticlePreviewModal] = useState(false);
  const [viewArticle, setViewArticle] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    summary: '',
    content: '',
    image: '',
    author: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy danh sách bài viết
        const articlesResponse = await articleApi.getAll();
        
        // Phân loại bài viết
        const allArticles = articlesResponse.data;
        setArticles(allArticles);
        
        // Lọc bài viết đang chờ phê duyệt
        const pending = allArticles.filter(article => 
          article.status === 'pending' || !article.status
        );
        setPendingArticles(pending);
        
        // Lấy danh sách bình luận
        const commentsResponse = await commentApi.getAll();
        setComments(commentsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hiển thị thông báo thành công
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Lọc danh sách bài viết theo từ khóa, danh mục và trạng thái
  const getFilteredArticles = () => {
    return articles.filter(article => {
      // Lọc theo từ khóa
      const matchesSearch = 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Lọc theo danh mục
      const matchesCategory = filterCategory ? article.category === filterCategory : true;
      
      // Lọc theo trạng thái
      const matchesStatus = filterStatus ? article.status === filterStatus : true;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  // Xử lý thêm tin tức mới
  const handleAddArticle = async () => {
    // Kiểm tra dữ liệu
    if (!formData.title || !formData.category || !formData.summary || !formData.content || !formData.image || !formData.author) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    
    try {
      // Thêm trạng thái 'approved' cho bài viết thêm mới từ admin
      const postData = {
        ...formData,
        status: 'approved',
        date: new Date().toISOString()
      };
      
      // Gửi dữ liệu lên server
      const response = await articleApi.create(postData);
      
      // Thêm bài viết mới vào danh sách
      setArticles([...articles, response.data]);
      
      setShowAddForm(false);
      resetForm();
      showSuccess('Thêm tin tức mới thành công!');
    } catch (err) {
      console.error('Error creating article:', err);
      alert('Không thể thêm tin tức. Vui lòng thử lại sau.');
    }
  };

  // Mở form sửa tin tức
  const handleEditClick = (article) => {
    setCurrentArticle(article);
    setFormData({
      title: article.title,
      category: article.category,
      summary: article.summary,
      content: article.content,
      image: article.image,
      author: article.author,
      status: article.status || 'pending'
    });
    setShowEditForm(true);
  };

  // Xử lý cập nhật tin tức
  const handleUpdateArticle = async () => {
    // Kiểm tra dữ liệu
    if (!formData.title || !formData.category || !formData.summary || !formData.content || !formData.image || !formData.author) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    
    try {
      // Gửi dữ liệu lên server
      const response = await articleApi.update(currentArticle.id, formData);
      
      // Cập nhật bài viết trong danh sách
      setArticles(articles.map(article => 
        article.id === currentArticle.id ? response.data : article
      ));
      
      // Cập nhật danh sách bài viết chờ duyệt nếu cần
      if (formData.status === 'pending') {
        setPendingArticles(pendingArticles.map(article => 
          article.id === currentArticle.id ? response.data : article
        ));
      } else {
        setPendingArticles(pendingArticles.filter(article => 
          article.id !== currentArticle.id
        ));
      }
      
      setShowEditForm(false);
      resetForm();
      showSuccess('Cập nhật tin tức thành công!');
    } catch (err) {
      console.error('Error updating article:', err);
      alert('Không thể cập nhật tin tức. Vui lòng thử lại sau.');
    }
  };

  // Xử lý xóa tin tức
  const handleDeleteArticle = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin tức này?')) {
      try {
        // Gửi yêu cầu xóa lên server
        await articleApi.delete(id);
        
        // Xóa bài viết khỏi danh sách
        setArticles(articles.filter(article => article.id !== id));
        
        // Xóa khỏi danh sách bài viết chờ duyệt nếu cần
        setPendingArticles(pendingArticles.filter(article => article.id !== id));
        
        showSuccess('Xóa tin tức thành công!');
      } catch (err) {
        console.error('Error deleting article:', err);
        alert('Không thể xóa tin tức. Vui lòng thử lại sau.');
      }
    }
  };

  // Xử lý xóa bình luận
  const handleDeleteComment = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      try {
        // Gửi yêu cầu xóa lên server
        await commentApi.delete(id);
        
        // Xóa bình luận khỏi danh sách
        setComments(comments.filter(comment => comment.id !== id));
        
        showSuccess('Xóa bình luận thành công!');
      } catch (err) {
        console.error('Error deleting comment:', err);
        alert('Không thể xóa bình luận. Vui lòng thử lại sau.');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      summary: '',
      content: '',
      image: '',
      author: '',
      status: 'pending'
    });
    setCurrentArticle(null);
  };

  // Xử lý thay đổi form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Hiển thị danh sách bình luận của một bài viết
  const handleViewComments = (article) => {
    setSelectedArticleForComments(article);
    setActiveTab('comments');
  };

  // Lọc bình luận theo bài viết đã chọn hoặc từ khóa
  const getFilteredComments = () => {
    if (selectedArticleForComments) {
      return comments.filter(comment => 
        comment.article_id === selectedArticleForComments.id
      );
    }
    
    return comments.filter(comment => 
      comment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.articleTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Hàm xử lý xem bài viết chờ duyệt
  const handleViewPendingArticle = (article) => {
    setViewPendingArticle(article);
    setShowPendingPreviewModal(true);
  };
  
  // Hàm xử lý xem bài viết bất kỳ
  const handleViewArticle = (article) => {
    setViewArticle(article);
    setShowArticlePreviewModal(true);
  };

  // Hàm xử lý phê duyệt bài viết
  const handleApproveArticle = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn phê duyệt bài viết này? Bài viết sẽ hiển thị công khai trên trang tin tức.')) {
      try {
        const article = pendingArticles.find(a => a.id === id);
        
        // Cập nhật trạng thái bài viết
        const updatedArticle = { ...article, status: 'approved' };
        await articleApi.update(id, updatedArticle);
        
        // Cập nhật danh sách
        setPendingArticles(pendingArticles.filter(a => a.id !== id));
        setArticles(articles.map(a => 
          a.id === id ? { ...a, status: 'approved' } : a
        ));
        
        showSuccess('Phê duyệt bài viết thành công! Bài viết đã được xuất bản.');
      } catch (err) {
        console.error('Error approving article:', err);
        alert('Không thể phê duyệt bài viết. Vui lòng thử lại sau.');
      }
    }
  };

  // Hàm xử lý từ chối bài viết
  const handleRejectArticle = async (id) => {
    const reason = prompt('Vui lòng nhập lý do từ chối bài viết (tùy chọn):');
    
    if (window.confirm('Bạn có chắc chắn muốn từ chối bài viết này?')) {
      try {
        const article = pendingArticles.find(a => a.id === id);
        
        // Cập nhật trạng thái bài viết
        const updatedArticle = { 
          ...article, 
          status: 'rejected',
          rejectionReason: reason || 'Bài viết không đáp ứng tiêu chuẩn xuất bản.'
        };
        await articleApi.update(id, updatedArticle);
        
        // Cập nhật danh sách
        setPendingArticles(pendingArticles.filter(a => a.id !== id));
        setArticles(articles.map(a => 
          a.id === id ? updatedArticle : a
        ));
        
        showSuccess('Từ chối bài viết thành công!');
      } catch (err) {
        console.error('Error rejecting article:', err);
        alert('Không thể từ chối bài viết. Vui lòng thử lại sau.');
      }
    }
  };

  // Danh sách các danh mục
  const categories = [
    "Tin Mới", "Sự Kiện", "Công Nghệ", "Giáo Dục", "Kinh Tế", "Thể Thao", "Văn Hóa", "Du Lịch"
  ];

  // Lấy danh sách danh mục duy nhất từ dữ liệu
  const uniqueCategories = [...new Set(articles.map(article => article.category))];

  // Lấy trạng thái bài viết dạng Badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <Badge bg="success"><FaCheckCircle className="me-1" /> Đã phê duyệt</Badge>;
      case 'rejected':
        return <Badge bg="danger"><FaTimesCircle className="me-1" /> Bị từ chối</Badge>;
      case 'pending':
      default:
        return <Badge bg="warning" text="dark"><FaInfoCircle className="me-1" /> Chờ duyệt</Badge>;
    }
  };

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="admin-dashboard">
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand>Quản Trị Nội Dung</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
              <Nav>
                <Button variant="outline-light" onClick={onLogout}>Đăng xuất</Button>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p className="mt-3">Đang tải dữ liệu...</p>
        </Container>
      </div>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <div className="admin-dashboard">
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand>Quản Trị Nội Dung</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
              <Nav>
                <Button variant="outline-light" onClick={onLogout}>Đăng xuất</Button>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container>
          <Alert variant="danger">
            {error}
          </Alert>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>Quản Trị Nội Dung</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              <Button variant="outline-light" onClick={onLogout}>Đăng xuất</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <header className="dashboard-header text-center mb-4">
          <h1>Quản Lý Nội Dung</h1>
          <p className="text-muted">Thêm, sửa, xóa và quản lý tất cả nội dung tin tức và bình luận</p>
        </header>
        
        {successMessage && (
          <Alert variant="success" className="mb-4">
            {successMessage}
          </Alert>
        )}
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="search-container" style={{ width: '60%' }}>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            variant="primary" 
            onClick={() => {
              setShowAddForm(true);
            }}
            className="px-4"
          >
            <FaPlus className="me-2" />Thêm Tin Tức Mới
          </Button>
        </div>
        
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => {
            setActiveTab(k);
            if (k === 'articles') {
              setSelectedArticleForComments(null);
            }
          }}
          className="mb-3"
        >
          <Tab eventKey="pending" title={`Bài viết chờ duyệt (${pendingArticles.length})`}>
            <div className="mb-3">
              <Alert variant="info">
                <FaInfoCircle className="me-2" />
                Có {pendingArticles.length} bài viết đang chờ phê duyệt
              </Alert>
            </div>
            
            <div className="table-responsive">
              <Table striped bordered hover className="shadow-sm">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: '5%' }}>ID</th>
                    <th style={{ width: '25%' }}>Tiêu đề</th>
                    <th style={{ width: '10%' }}>Danh mục</th>
                    <th style={{ width: '15%' }}>Tác giả</th>
                    <th style={{ width: '15%' }}>Ngày gửi</th>
                    <th style={{ width: '30%' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingArticles.length > 0 ? (
                    pendingArticles.map((article) => (
                      <tr key={article.id}>
                        <td>{article.id}</td>
                        <td className="fw-bold">{article.title}</td>
                        <td>
                          <Badge bg="primary" pill className="px-3 py-2">{article.category}</Badge>
                        </td>
                        <td>{article.author}</td>
                        <td>{new Date(article.date).toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="info" 
                              size="sm"
                              onClick={() => handleViewPendingArticle(article)}
                            >
                              <FaEye className="me-1" /> Xem
                            </Button>
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => handleApproveArticle(article.id)}
                            >
                              <FaCheckCircle className="me-1" /> Phê duyệt
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleRejectArticle(article.id)}
                            >
                              <FaTimesCircle className="me-1" /> Từ chối
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="text-muted">
                          <i className="bi bi-inbox-fill me-2 fs-4"></i>
                          <p className="mb-0">Không có bài viết nào đang chờ phê duyệt</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Tab>
          
          <Tab eventKey="articles" title="Quản lý Tin Tức">
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2 align-items-center">
                <div>
                  <Form.Select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="form-select-sm"
                    style={{ width: '200px' }}
                  >
                    <option value="">Tất cả danh mục</option>
                    {uniqueCategories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </div>
                <div>
                  <Form.Select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="form-select-sm"
                    style={{ width: '200px' }}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="approved">Đã phê duyệt</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                  </Form.Select>
                </div>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => {
                    setFilterCategory('');
                    setFilterStatus('');
                    setSearchTerm('');
                  }}
                >
                  <FaFilter className="me-1" /> Reset bộ lọc
                </Button>
              </div>
              
              <div>
                <span className="text-muted">
                  Tổng số: {getFilteredArticles().length} bài viết
                </span>
              </div>
            </div>
            
            <div className="table-responsive">
              <Table striped bordered hover className="shadow-sm">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: '5%' }}>ID</th>
                    <th style={{ width: '25%' }}>Tiêu đề</th>
                    <th style={{ width: '10%' }}>Danh mục</th>
                    <th style={{ width: '10%' }}>Tác giả</th>
                    <th style={{ width: '10%' }}>Ngày tạo</th>
                    <th style={{ width: '10%' }}>Trạng thái</th>
                    <th style={{ width: '30%' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredArticles().length > 0 ? (
                    getFilteredArticles().map((article) => (
                      <tr key={article.id}>
                        <td>{article.id}</td>
                        <td className="fw-bold">{article.title}</td>
                        <td>
                          <Badge bg="primary" pill className="px-3 py-2">{article.category}</Badge>
                        </td>
                        <td>{article.author}</td>
                        <td>{new Date(article.date).toLocaleDateString()}</td>
                        <td>{getStatusBadge(article.status)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="info" 
                              size="sm"
                              onClick={() => handleViewArticle(article)}
                            >
                              <FaEye className="me-1" /> Xem
                            </Button>
                            <Button 
                              variant="warning" 
                              size="sm"
                              onClick={() => handleEditClick(article)}
                            >
                              <FaEdit className="me-1" /> Sửa
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDeleteArticle(article.id)}
                            >
                              <FaTrash className="me-1" /> Xóa
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleViewComments(article)}
                            >
                              <FaComment className="me-1" /> Bình luận ({article.commentCount || 0})
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div className="text-muted">
                          <FaInfoCircle className="me-2" />
                          <p className="mb-0">Không tìm thấy bài viết nào phù hợp với điều kiện tìm kiếm</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Tab>
          
          <Tab eventKey="comments" title="Quản lý Bình Luận">
            <div className="mb-3">
              {selectedArticleForComments && (
                <Alert variant="info" className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Đang xem bình luận cho: </strong> {selectedArticleForComments.title}
                  </div>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setSelectedArticleForComments(null)}
                  >
                    Xem tất cả bình luận
                  </Button>
                </Alert>
              )}
            </div>
            
            <div className="table-responsive">
              <Table striped bordered hover className="shadow-sm">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: '5%' }}>ID</th>
                    <th style={{ width: '15%' }}>Tên người bình luận</th>
                    <th style={{ width: '20%' }}>Bài viết</th>
                    <th style={{ width: '30%' }}>Nội dung</th>
                    <th style={{ width: '10%' }}>Đánh giá</th>
                    <th style={{ width: '10%' }}>Ngày đăng</th>
                    <th style={{ width: '10%' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredComments().length > 0 ? (
                    getFilteredComments().map((comment) => (
                      <tr key={comment.id}>
                        <td>{comment.id}</td>
                        <td>{comment.name}</td>
                        <td>
                          <a href={`/tin-tuc/${comment.article_id}`} target="_blank" rel="noopener noreferrer">
                            {comment.articleTitle}
                          </a>
                        </td>
                        <td>
                          <div style={{ maxHeight: '80px', overflow: 'auto' }}>
                            {comment.comment}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaStar className="text-warning me-1" />
                            <span>{comment.rating || 0}/5</span>
                          </div>
                        </td>
                        <td>{new Date(comment.date).toLocaleDateString()}</td>
                        <td>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <FaTrash className="me-1" /> Xóa
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                      <div className="text-muted">
                          <i className="bi bi-chat-square-text me-2 fs-4"></i>
                          <p className="mb-0">Không tìm thấy bình luận nào</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Tab>
        </Tabs>
      </Container>

      {/* Modal Thêm Tin Tức */}
      <Modal show={showAddForm} onHide={() => setShowAddForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thêm Tin Tức Mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Nhập tiêu đề tin tức" 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select 
                name="category"
                value={formData.category}
                onChange={handleFormChange}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tóm tắt</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2}
                name="summary"
                value={formData.summary}
                onChange={handleFormChange}
                placeholder="Nhập tóm tắt nội dung" 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nội dung</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={5}
                name="content"
                value={formData.content}
                onChange={handleFormChange}
                placeholder="Nhập nội dung chi tiết" 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Đường dẫn hình ảnh</Form.Label>
              <Form.Control 
                type="text" 
                name="image"
                value={formData.image}
                onChange={handleFormChange}
                placeholder="Nhập đường dẫn hình ảnh" 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tác giả</Form.Label>
              <Form.Control 
                type="text" 
                name="author"
                value={formData.author}
                onChange={handleFormChange}
                placeholder="Nhập tên tác giả" 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select 
                name="status"
                value={formData.status}
                onChange={handleFormChange}
              >
                <option value="approved">Đã phê duyệt</option>
                <option value="pending">Chờ duyệt</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Tin tức được thêm bởi Admin sẽ được phê duyệt mặc định.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddForm(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddArticle}>
            Thêm Tin Tức
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Sửa Tin Tức */}
      <Modal show={showEditForm} onHide={() => setShowEditForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Sửa Tin Tức</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Nhập tiêu đề tin tức" 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select 
                name="category"
                value={formData.category}
                onChange={handleFormChange}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tóm tắt</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2}
                name="summary"
                value={formData.summary}
                onChange={handleFormChange}
                placeholder="Nhập tóm tắt nội dung" 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nội dung</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={5}
                name="content"
                value={formData.content}
                onChange={handleFormChange}
                placeholder="Nhập nội dung chi tiết" 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Đường dẫn hình ảnh</Form.Label>
              <Form.Control 
                type="text" 
                name="image"
                value={formData.image}
                onChange={handleFormChange}
                placeholder="Nhập đường dẫn hình ảnh" 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tác giả</Form.Label>
              <Form.Control 
                type="text" 
                name="author"
                value={formData.author}
                onChange={handleFormChange}
                placeholder="Nhập tên tác giả" 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select 
                name="status"
                value={formData.status}
                onChange={handleFormChange}
              >
                <option value="approved">Đã phê duyệt</option>
                <option value="pending">Chờ duyệt</option>
                <option value="rejected">Từ chối</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditForm(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleUpdateArticle}>
            Cập Nhật
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Xem trước bài viết chờ duyệt */}
      <Modal show={showPendingPreviewModal} onHide={() => setShowPendingPreviewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Xem trước bài viết</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewPendingArticle && (
            <div className="article-preview">
              <Alert variant="warning">
                <FaInfoCircle className="me-2" />
                Bài viết này đang chờ phê duyệt. Chỉ hiển thị công khai sau khi được phê duyệt.
              </Alert>
              
              <h3 className="mb-3">{viewPendingArticle.title}</h3>
              
              <div className="d-flex align-items-center mb-3">
                <Badge bg="primary" className="me-2">{viewPendingArticle.category}</Badge>
                <small className="text-muted me-3">
                  <FaCalendarAlt className="me-1" /> {new Date(viewPendingArticle.date).toLocaleDateString()}
                </small>
                <small className="text-muted">
                  <FaUser className="me-1" /> {viewPendingArticle.author}
                </small>
              </div>
              
              <img 
                src={viewPendingArticle.image} 
                alt={viewPendingArticle.title} 
                className="img-fluid rounded mb-3" 
                style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/img/placeholder.jpg';
                }}
              />
              
              <h5 className="mb-3 fw-bold">Tóm tắt:</h5>
              <p>{viewPendingArticle.summary}</p>
              
              <h5 className="mb-3 fw-bold">Nội dung:</h5>
              <div dangerouslySetInnerHTML={{ __html: viewPendingArticle.content }}></div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPendingPreviewModal(false)}>
            Đóng
          </Button>
          <Button 
            variant="success" 
            onClick={() => {
              handleApproveArticle(viewPendingArticle.id);
              setShowPendingPreviewModal(false);
            }}
          >
            <FaCheckCircle className="me-1" /> Phê duyệt
          </Button>
          <Button 
            variant="danger" 
            onClick={() => {
              handleRejectArticle(viewPendingArticle.id);
              setShowPendingPreviewModal(false);
            }}
          >
            <FaTimesCircle className="me-1" /> Từ chối
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Xem bài viết bất kỳ */}
      <Modal show={showArticlePreviewModal} onHide={() => setShowArticlePreviewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Xem bài viết</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewArticle && (
            <div className="article-preview">
              {viewArticle.status === 'pending' && (
                <Alert variant="warning">
                  <FaInfoCircle className="me-2" />
                  Bài viết này đang chờ phê duyệt.
                </Alert>
              )}
              
              {viewArticle.status === 'rejected' && (
                <Alert variant="danger">
                  <FaTimesCircle className="me-2" />
                  Bài viết này đã bị từ chối.
                  {viewArticle.rejectionReason && (
                    <div className="mt-2">
                      <strong>Lý do:</strong> {viewArticle.rejectionReason}
                    </div>
                  )}
                </Alert>
              )}
              
              <h3 className="mb-3">{viewArticle.title}</h3>
              
              <div className="d-flex align-items-center mb-3">
                <Badge bg="primary" className="me-2">{viewArticle.category}</Badge>
                <small className="text-muted me-3">
                  <FaCalendarAlt className="me-1" /> {new Date(viewArticle.date).toLocaleDateString()}
                </small>
                <small className="text-muted">
                  <FaUser className="me-1" /> {viewArticle.author}
                </small>
              </div>
              
              <img 
                src={viewArticle.image} 
                alt={viewArticle.title} 
                className="img-fluid rounded mb-3" 
                style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/img/placeholder.jpg';
                }}
              />
              
              <h5 className="mb-3 fw-bold">Tóm tắt:</h5>
              <p>{viewArticle.summary}</p>
              
              <h5 className="mb-3 fw-bold">Nội dung:</h5>
              <div dangerouslySetInnerHTML={{ __html: viewArticle.content }}></div>
              
              <div className="mt-4">
                <h5 className="mb-3 fw-bold">Thông tin thêm:</h5>
                <ul className="list-group">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Trạng thái
                    <span>{getStatusBadge(viewArticle.status)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Lượt xem
                    <span className="badge bg-secondary rounded-pill">{viewArticle.views || 0}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Đánh giá
                    <span>
                      {Array(5).fill().map((_, i) => (
                        <FaStar key={i} className={i < Math.round(viewArticle.averageRating || 0) ? "text-warning" : "text-muted"} />
                      ))}
                      {' '}({parseFloat(viewArticle.averageRating || 0).toFixed(1)}/5)
                    </span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Bình luận
                    <span className="badge bg-primary rounded-pill">{viewArticle.commentCount || 0}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowArticlePreviewModal(false)}>
            Đóng
          </Button>
          <Button 
            variant="warning" 
            onClick={() => {
              handleEditClick(viewArticle);
              setShowArticlePreviewModal(false);
            }}
          >
            <FaEdit className="me-1" /> Sửa bài viết
          </Button>
          {viewArticle && viewArticle.status === 'pending' && (
            <>
              <Button 
                variant="success" 
                onClick={() => {
                  handleApproveArticle(viewArticle.id);
                  setShowArticlePreviewModal(false);
                }}
              >
                <FaCheckCircle className="me-1" /> Phê duyệt
              </Button>
              <Button 
                variant="danger" 
                onClick={() => {
                  handleRejectArticle(viewArticle.id);
                  setShowArticlePreviewModal(false);
                }}
              >
                <FaTimesCircle className="me-1" /> Từ chối
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminDashboard;