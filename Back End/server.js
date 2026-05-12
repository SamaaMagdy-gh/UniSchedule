const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();
 app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
 const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students'); 
const courseRoutes = require('./routes/courses');
const teacherRoutes = require('./routes/teachers');
const roomRoutes = require('./routes/rooms');
const dashboardRoutes = require('./routes/dashboard');
const requestRoutes = require('./routes/requests');
const chatbotRoutes = require('./routes/chatbot');
const reviewRoutes = require('./routes/reviews');
 app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/teachers', teacherRoutes);  
app.use('/api/rooms', roomRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/registration', require('./routes/registration'));
app.use('/api/requests', requestRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/reviews', reviewRoutes);
 app.get('/api/health', (req, res) => res.json({ status: "ok" }));

// ------------------------------------
 const PORT = process.env.PORT || 5001; 
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/unischedule';
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on: http://localhost:${PORT}`);
      console.log(`Accessible on your network at: http://YOUR_IP_ADDRESS:${PORT}`);
    });
  })
  .catch((err) => console.error("Database connection error:", err.message));
