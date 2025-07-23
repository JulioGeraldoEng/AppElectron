const express = require('express');
const router = express.Router();
const db = require('../db');

const verificarToken = require('../Middlewares/verificarToken');
const autorizarTipo = require('../Middlewares/autorizarTipo');
const cadastroController = require('../Controllers/cadastroController');

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

// ✅ Rota: Cadastrar funcionário
router.post(
  '/cadastrar-funcionario',
  verificarToken,
  autorizarTipo('admin'),
  cadastroController.cadastrarFuncionario
);

// ✅ Rota: Cadastrar cliente
router.post(
  '/cadastrar-cliente',
  verificarToken,
  autorizarTipo('admin'),
  cadastroController.cadastrarCliente
);

// ✅ Rota: Cadastrar admin
router.post(
  '/cadastrar-admin',
  verificarToken,
  autorizarTipo('admin'),
  cadastroController.cadastrarAdmin
);

module.exports = router;
