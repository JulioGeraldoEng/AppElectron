const express = require('express');
const router = express.Router();
const db = require('../db');

const verificarToken = require('../Middlewares/verificarToken');
const autorizarTipo = require('../Middlewares/autorizarTipo');

// Rota para obter dados completos do funcionário autenticado
router.get('/meus-dados', verificarToken, autorizarTipo('funcionario'), async (req, res) => {
  const idUsuario = req.usuario.id;

  try {
    // Buscar dados na tabela usuarios
    const usuarioResult = await db.query(
      'SELECT id, email, tipo FROM usuarios WHERE id = $1',
      [idUsuario]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    const usuario = usuarioResult.rows[0];

    // Buscar dados na tabela funcionarios
    const funcionarioResult = await db.query(
      'SELECT nome, cargo, telefone FROM funcionarios WHERE usuario_id = $1',
      [idUsuario]
    );

    if (funcionarioResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Dados do funcionário não encontrados.' });
    }

    const funcionario = funcionarioResult.rows[0];

    // Retorna os dados combinados
    res.json({
      success: true,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
        ...funcionario
      }
    });

  } catch (error) {
    console.error('Erro ao buscar dados do funcionário:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar dados do funcionário.' });
  }
});

// Rota protegida para funcionários - exemplo existente
router.get('/ordens', verificarToken, autorizarTipo('funcionario'), (req, res) => {
  res.json({
    success: true,
    message: 'Bem-vindo, funcionário! Aqui estão suas ordens de serviço.'
  });
});

module.exports = router;
