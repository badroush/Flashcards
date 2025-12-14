// controllers/history.controller.js
const History = require('../models/history.model');

exports.getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const entries = await History.find({ userId }).sort({ date: -1 });
    res.status(200).json({ status: 'success',  entries });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Erreur serveur' });
  }
};

exports.addHistory = async (req, res) => {
  try {
    const entry = await History.create(req.body);
    res.status(201).json({ status: 'success',  entry });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// controllers/history.controller.js

exports.getUserStats = async (req, res) => {
  console.log('🔍 [BACKEND] Requête pour stats de userId:', req.params.userId);
  try {
    const { userId } = req.params;
    // Récupérer toutes les parties de l'utilisateur
    const entries = await History.find({ userId });
        console.log('📋 [BACKEND] Parties trouvées:', entries.length);
    if (entries.length === 0) {
       console.log('📭 [BACKEND] Aucune partie trouvée pour cet utilisateur');
      return res.status(200).json({
        status: 'success',
        data: { bestScore: 0, gameCount: 0, history: [] }
      });
    }
    // Calculer les stats
    const bestScore = Math.max(...entries.map(e => e.score));
    const gameCount = entries.length;
    console.log('📊 [BACKEND] Stats calculées:', { bestScore, gameCount });
    res.status(200).json({
      status: 'success',
      data: { bestScore, gameCount, history: entries }
    });
  } catch (error) {
    console.error('💥 [BACKEND] Erreur serveur:', error.message);
    res.status(500).json({ status: 'fail', message: 'Erreur serveur' });
  }
};