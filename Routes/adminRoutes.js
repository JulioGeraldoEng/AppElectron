const express = require('express');
const router = express.Router();
const db = require('../db');
const { autenticar, autorizar } = require('../Middlewares/authMiddleware');

// Apenas administradores podem listar usuários
router.get('/usuarios', autenticar, autorizar('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, tipo FROM usuarios');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
});

module.exports = router;
