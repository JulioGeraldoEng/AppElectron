const express = require('express');
const router = express.Router();

const verificarToken = require('../Middlewares/verificarToken');
const autorizarTipo = require('../Middlewares/autorizarTipo');

// Rota protegida para clientes
router.get('/meus-dados', verificarToken, autorizarTipo('cliente'), (req, res) => {
  res.json({
    id: req.usuario.id,
    tipo: req.usuario.tipo,
    mensagem: 'Bem-vindo, cliente! Aqui estão seus dados pessoais.'
  });
});

module.exports = router;
