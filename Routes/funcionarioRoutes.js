const express = require('express');
const router = express.Router();

const verificarToken = require('../Middlewares/verificarToken');
const autorizarTipo = require('../Middlewares/autorizarTipo');

// Rota protegida para funcionários
router.get('/ordens', verificarToken, autorizarTipo('funcionario'), (req, res) => {
  res.json({
    success: true,
    message: 'Bem-vindo, funcionário! Aqui estão suas ordens de serviço.'
  });
});

module.exports = router;
