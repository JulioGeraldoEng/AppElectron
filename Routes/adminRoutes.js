const express = require('express');
const router = express.Router();
const db = require('../db');

const verificarToken = require('../Middlewares/verificarToken');
const autorizarTipo = require('../Middlewares/autorizarTipo');

// Apenas administradores podem listar usuários
router.get('/usuarios', verificarToken, autorizarTipo('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, tipo FROM usuarios');
    res.json({ success: true, usuarios: result.rows });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar usuários.' });
  }
});

module.exports = router;
