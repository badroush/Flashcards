// models/history.model.js
const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  gameMode: { type: String, enum: ['solo', 'multi'], required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  duration: { type: Number } // optionnel
});

module.exports = mongoose.model('History', HistorySchema);