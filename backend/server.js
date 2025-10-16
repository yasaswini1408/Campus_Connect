const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
require('./cron');

const app = express();
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const doubtRoutes = require('./routes/doubts');
const adminRoutes = require('./routes/admin');
const noticeRoutes = require('./routes/notices');
const attendanceRoutes = require('./routes/attendance');
const resourceRoutes = require('./routes/resources');
const resultRoutes = require('./routes/results');
const notificationRoutes = require('./routes/notifications');
const libraryRoutes = require('./routes/library');
const studyGroupRoutes = require('./routes/studyGroups');
const assignmentRoutes = require('./routes/assignments');


// Middleware
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/study-groups', studyGroupRoutes);
app.use('/api/assignments', assignmentRoutes);


// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//socket.io

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinGroup", ({ groupId, user }) => {
    socket.join(groupId);
    io.to(groupId).emit("message", { user: "System", text: `${user.name} joined the group` });
  });

  socket.on("chatMessage", ({ groupId, user, text }) => {
    io.to(groupId).emit("message", { user, text });
  });

  socket.on("uploadFile", ({ groupId, user, fileName }) => {
    io.to(groupId).emit("message", { user, text: `uploaded a file: ${fileName}` });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

http.listen(3000, () => console.log(`Server running on http://localhost:3000`));



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} at http://localhost:${PORT}`));
