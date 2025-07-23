const express = require('express');
const router = express.Router();
const db = require('../db');

const verificarToken = require('../Middlewares/verificarToken');
const autorizarTipo = require('../Middlewares/autorizarTipo');

// 🔐 Rota protegida para clientes: retorna seus próprios dados completos
router.get('/meus-dados', verificarToken, autorizarTipo('cliente'), async (req, res) => {
  console.log('Usuário autenticado:', req.usuario); // DEBUG

  const idUsuario = req.usuario.id;

  try {
    const usuarioResult = await db.query(
      'SELECT id, email, tipo FROM usuarios WHERE id = $1',
      [idUsuario]
    );
    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    const clienteResult = await db.query(
      'SELECT nome, cpf, endereco FROM clientes WHERE usuario_id = $1',
      [idUsuario]
    );
    if (clienteResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Dados do cliente não encontrados.' });
    }

    const usuario = usuarioResult.rows[0];
    const cliente = clienteResult.rows[0];

    res.json({
      success: true,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
        ...cliente
      }
    });

  } catch (error) {
    console.error('Erro ao buscar dados do cliente:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar dados do cliente.' });
  }
});


module.exports = router;
