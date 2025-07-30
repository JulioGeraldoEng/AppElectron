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

// Busca clientes
router.get('/clientes', verificarToken, autorizarTipo('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT id AS id_cliente, nome FROM clientes ORDER BY nome');
    res.json({ success: true, clientes: result.rows });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar clientes.' });
  }
});

// Busca planos
router.get('/planos', verificarToken, autorizarTipo('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT id_plano, nome_plano FROM planos ORDER BY nome_plano');
    res.json({ success: true, planos: result.rows });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar planos.' });
  }
});

router.get('/equipamentos', verificarToken, autorizarTipo('admin'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id_equipamento, modelo
      FROM equipamentos
      ORDER BY modelo
    `);

    res.json({ success: true, equipamentos: result.rows });
  } catch (error) {
    console.error('Erro ao buscar equipamentos:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar equipamentos.' });
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

// ✅ Rota: Cadastrar plano
router.post(
  '/cadastrar-plano',
  verificarToken,
  autorizarTipo('admin'),
  cadastroController.cadastrarPlano
);

// ✅ Rota: Cadastrar contrato
router.post(
  '/cadastrar-contrato',
  verificarToken,
  autorizarTipo('admin'),
  cadastroController.cadastrarContrato
);

// ✅ Rota: Cadastrar equipamento
router.post(
  '/cadastrar-equipamento',
  verificarToken,
  autorizarTipo('admin'),
  cadastroController.cadastrarEquipamento
);

// ✅ Rota: Cadastrar conexao
router.post(
  '/cadastrar-conexao',
  verificarToken,
  autorizarTipo('admin'),
  cadastroController.cadastrarConexao
);

module.exports = router;
