// src/components/Nav.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav as BootstrapNav, Button, Dropdown } from 'react-bootstrap';
import { FaUser, FaEdit, FaList, FaSignOutAlt, FaSignInAlt, FaPen, FaHome, FaPhone, FaNewspaper } from 'react-icons/fa';

function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập
    const checkLoginStatus = () => {
      const storedUsername = localStorage.getItem('username');
      const storedRole = localStorage.getItem('userRole');
      const auth = localStorage.getItem('isAuthenticated');
      
      setIsLoggedIn(auth === 'true');
      setUsername(storedUsername || '');
      setUserRole(storedRole || '');
    };
    
    checkLoginStatus();
    
    // Thêm sự kiện scroll để thay đổi màu navbar
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', checkLoginStatus);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  // Xác định nếu đang ở trang admin
  const isAdminPage = location.pathname.includes('/admin');

  // Tạo class cho navbar dựa trên trạng thái scroll và đường dẫn hiện tại
  const navbarClass = `navbar navbar-expand-lg ${
    isScrolled || !location.pathname.startsWith('/') || location.pathname.length > 1
      ? 'navbar-light bg-light shadow-sm'
      : 'navbar-dark bg-transparent'
  } fixed-top py-3 transition`;

  return (
    <Navbar 
      expand="lg" 
      className={navbarClass} 
      id="mainNav"
    >
      <Container className="px-4 px-lg-5">
        <Link className="navbar-brand fw-bold" to="/">Tin Tức 24h</Link>
        <Navbar.Toggle aria-controls="navbarResponsive" />
        <Navbar.Collapse id="navbarResponsive">
          <BootstrapNav className="ms-auto my-2 my-lg-0">
            <BootstrapNav.Item>
              <Link className="nav-link px-lg-3 py-3 py-lg-4" to="/">
                <FaHome className="me-1 d-none d-md-inline" /> Trang Chủ
              </Link>
            </BootstrapNav.Item>
            <BootstrapNav.Item>
              <a className="nav-link px-lg-3 py-3 py-lg-4" href="/#tin-tuc">
                <FaNewspaper className="me-1 d-none d-md-inline" /> Tin Tức
              </a>
            </BootstrapNav.Item>
            <BootstrapNav.Item>
              <Link className="nav-link px-lg-3 py-3 py-lg-4" to="/create-post">
                <FaPen className="me-1 d-none d-md-inline" /> Đăng Bài
              </Link>
            </BootstrapNav.Item>
            <BootstrapNav.Item>
              <a className="nav-link px-lg-3 py-3 py-lg-4" href="/#lien-he">
                <FaPhone className="me-1 d-none d-md-inline" /> Liên Hệ
              </a>
            </BootstrapNav.Item>
            
          {isLoggedIn ? (
            userRole === 'admin' ? (
              // Menu cho admin
              <Dropdown as={BootstrapNav.Item}>
                <Dropdown.Toggle as="a" className="nav-link px-lg-3 py-3 py-lg-4 d-flex align-items-center" style={{ cursor: 'pointer' }}>
                  <FaUser className="me-1" /> {username}
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item as={Link} to="/admin">
                    <FaList className="me-2" /> Quản trị
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              // Menu cho user đã đăng nhập
              <Dropdown as={BootstrapNav.Item}>
                <Dropdown.Toggle as="a" className="nav-link px-lg-3 py-3 py-lg-4 d-flex align-items-center" style={{ cursor: 'pointer' }}>
                  <FaUser className="me-1" /> {username}
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item as={Link} to="/create-post">
                    <FaPen className="me-2" /> Đăng bài viết
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/my-posts">
                    <FaEdit className="me-2" /> Bài viết của tôi
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )
          ) : (
            // Menu cho người chưa đăng nhập
            <BootstrapNav.Item>
              <Link className="nav-link px-lg-3 py-3 py-lg-4" to="/login">
                <FaSignInAlt className="me-1 d-none d-md-inline" /> Đăng Nhập
              </Link>
            </BootstrapNav.Item>
          )}
          </BootstrapNav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Nav;