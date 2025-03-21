// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const articleRoutes = require('./routes/articleRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);

// Kiểm tra môi trường
console.log(`Môi trường: ${process.env.NODE_ENV}`);

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));