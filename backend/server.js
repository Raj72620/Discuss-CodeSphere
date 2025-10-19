// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const contributorRoutes = require('./routes/contributorRoutes');
const chatRoutes = require('./routes/chatRoutes');
const searchRoutes = require('./routes/searchRoutes');
const savedPostsRoutes = require('./routes/savedPostsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const server = createServer(app);

// CORS configuration with environment variables
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-netlify-app-name.netlify.app',
  process.env.FRONTEND_URL // Add environment variable for frontend URL
].filter(Boolean); // Remove any undefined values

// OLD CODE - Commented out
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"]
//   }
// });

// NEW CODE - Using environment variables for CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set('io', io);

// Middleware

// OLD CODE - Commented out
// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true
// }));

// NEW CODE - Using environment variables for CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/profile', userRoutes);
app.use('/api/users', contributorRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', savedPostsRoutes);
app.use('/api', uploadRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'CodeSphere API is running!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      comments: '/api/comments',
      profile: '/api/profile',
      contributors: '/api/users/contributors',
      search: '/api/search',
      saved: '/api/posts/saved',
      upload: '/api/upload'
    },
    cors: {
      allowedOrigins: allowedOrigins
    }
  });
});

// Socket.io Connection Handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join-user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room: user_${userId}`);
  });

  // Join conversation room
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`Socket ${socket.id} left conversation: ${conversationId}`);
  });

  // Handle new message
  socket.on('send-message', async (messageData) => {
    try {
      // Broadcast to all users in the conversation
      io.to(`conversation_${messageData.conversation}`).emit('new-message', messageData);
      
      // Notify other participant about new message
      messageData.participants.forEach(participantId => {
        if (participantId !== messageData.sender._id) {
          io.to(`user_${participantId}`).emit('message-notification', {
            conversationId: messageData.conversation,
            sender: messageData.sender,
            message: messageData.content,
            unreadCount: 1
          });
        }
      });
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // Handle message edit
  socket.on('edit-message', (updatedMessage) => {
    io.to(`conversation_${updatedMessage.conversation}`).emit('message-edited', updatedMessage);
  });

  // Handle message delete
  socket.on('delete-message', (deletedMessage) => {
    io.to(`conversation_${deletedMessage.conversation}`).emit('message-deleted', deletedMessage);
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user-typing', {
      userId: data.userId,
      username: data.username
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user-stop-typing', {
      userId: data.userId
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Database connection with enhanced error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🎯 Host:', mongoose.connection.host);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Database connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📴 MongoDB connection closed through app termination');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔌 Socket.io is running`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌍 Allowed CORS origins:`, allowedOrigins);
  });
});

