const express = require('express');
const router = express.Router();
const { autenticar, autorizar } = require('../Middlewares/authMiddleware');

// Exemplo de rota apenas para clientes
router.get('/meus-dados', autenticar, autorizar('cliente'), (req, res) => {
  res.json({
    id: req.session.usuario.id,
    tipo: req.session.usuario.tipo,
    mensagem: 'Bem-vindo, cliente! Aqui estão seus dados pessoais.'
  });
});

module.exports = router;
