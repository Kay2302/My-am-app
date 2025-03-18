CREATE DATABASE IF NOT EXISTS news_db;

USE news_db;

-- Bảng Users
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Articles
CREATE TABLE IF NOT EXISTS articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  image VARCHAR(255),
  category VARCHAR(50),
  author VARCHAR(50),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  views INT DEFAULT 0,
  average_rating FLOAT DEFAULT 0,
  comment_count INT DEFAULT 0,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng Comments
CREATE TABLE IF NOT EXISTS comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  article_id INT,
  name VARCHAR(100) NOT NULL,
  comment TEXT NOT NULL,
  rating INT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Thêm dữ liệu mẫu cho users
INSERT INTO users (username, password, role) VALUES
('admin', '$2a$10$ABC123', 'admin'),
('user', '$2a$10$XYZ456', 'user'),
('user2', '$2a$10$DEF789', 'user');