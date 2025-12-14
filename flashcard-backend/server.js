// =============================
// 📁 server.js (VERSION ROBUSTE)
// =============================
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

// === Express App ===
const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:8100",
  credentials: true
}));

// === Import Routes ===
const flashcardRoutes = require('./routes/flashcard_route');
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const historyRoutes = require('./routes/history.route');

app.use('/api/card', flashcardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/history', historyRoutes); 

// === MongoDB Connection ===
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('🟢 MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error.message);
    process.exit(1);
  }
};

// === Create HTTP Server ===
const server = http.createServer(app);

// === Socket.IO Initialization ===
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8100",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
  });
});
