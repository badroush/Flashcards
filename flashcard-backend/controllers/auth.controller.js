// controllers/auth.controller.js
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "flashcard-secret-key", {
    expiresIn: "7d",
  });
};

// 📝 Inscription (rôle par défaut: USER)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email déjà utilisé" });
    }
    // Crée un utilisateur avec rôle par défaut 'USER'
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({
      status: "success",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};
// 🔑 Connexion (renvoie aussi le rôle)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email ou mot de passe incorrect" });
    }
    const token = generateToken(user._id);
    res.json({
      status: "success",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Erreur serveur" });
  }
};
