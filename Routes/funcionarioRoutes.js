const express = require('express');
const router = express.Router();
const { autenticar, autorizar } = require('../Middlewares/authMiddleware');

// Exemplo de rota apenas para funcionários
router.get('/ordens', autenticar, autorizar('funcionario'), (req, res) => {
  res.json({ message: 'Bem-vindo, funcionário! Aqui estão suas ordens de serviço.' });
});

module.exports = router;
