const bcrypt = require('bcrypt');
const db = require('../db');

const cadastroController = {
  async cadastrarFuncionario(req, res) {
    const { email, senha, nome, telefone, cpf, rg, endereco, cargo, data_nascimento } = req.body;

    if (!email || !senha || !nome) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios não preenchidos.' });
    }

    try {
      const existe = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
      if (existe.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'E-mail já cadastrado.' });
      }

      const hash = await bcrypt.hash(senha, 10);

      const novoUsuario = await db.query(
        'INSERT INTO usuarios (email, senha, tipo) VALUES ($1, $2, $3) RETURNING id',
        [email, hash, 'funcionario']
      );

      const usuarioId = novoUsuario.rows[0].id;

      await db.query(
        `INSERT INTO funcionarios (
          usuario_id, nome, cpf, rg, email, telefone, endereco, cargo, data_nascimento, data_admissao, data_demissao
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE, NULL)`,
        [
          usuarioId,
          nome,
          cpf || null,
          rg || null,
          email,
          telefone || null,
          endereco || null,
          cargo || null,
          data_nascimento || null
        ]
      );

      return res.status(201).json({ success: true, message: 'Funcionário cadastrado com sucesso.' });
    } catch (error) {
      console.error('Erro ao cadastrar funcionário:', error);
      return res.status(500).json({ success: false, message: 'Erro ao cadastrar funcionário.' });
    }
  },


  async cadastrarAdmin(req, res) {
    const { email, senha, nome, telefone, cpf, rg, endereco } = req.body;

    if (!email || !senha || !nome) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios não preenchidos.' });
    }

    try {
      const existe = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
      if (existe.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'E-mail já cadastrado.' });
      }

      const hash = await bcrypt.hash(senha, 10);

      const novoUsuario = await db.query(
        'INSERT INTO usuarios (email, senha, tipo) VALUES ($1, $2, $3) RETURNING id',
        [email, hash, 'admin']
      );

      const usuarioId = novoUsuario.rows[0].id;

      await db.query(
        `INSERT INTO admins (
          usuario_id, nome, cpf, rg, email, telefone, endereco, data_admissao, data_demissao
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, NULL)`,
        [usuarioId, nome, cpf || null, rg || null, email, telefone || null, endereco || null]
      );

      return res.status(201).json({ success: true, message: 'Administrador cadastrado com sucesso.' });
    } catch (error) {
      console.error('Erro ao cadastrar admin:', error);
      return res.status(500).json({ success: false, message: 'Erro ao cadastrar administrador.' });
    }
  },

  async cadastrarCliente(req, res) {
    const { email, senha, nome, telefone, cpf, rg, endereco } = req.body;

    if (!email || !senha || !nome) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios não preenchidos.' });
    }

    try {
      const existe = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
      if (existe.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'E-mail já cadastrado.' });
      }

      const hash = await bcrypt.hash(senha, 10);

      const novoUsuario = await db.query(
        'INSERT INTO usuarios (email, senha, tipo) VALUES ($1, $2, $3) RETURNING id',
        [email, hash, 'cliente']
      );

      const usuarioId = novoUsuario.rows[0].id;

      await db.query(
        `INSERT INTO clientes (
          usuario_id, nome, cpf, rg, email, telefone, endereco, data_cadastro, data_cancelamento
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, NULL)`,
        [usuarioId, nome, cpf || null, rg || null, email, telefone || null, endereco || null]
      );

      return res.status(201).json({ success: true, message: 'Cliente cadastrado com sucesso.' });
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      return res.status(500).json({ success: false, message: 'Erro ao cadastrar cliente.' });
    }
  },

  async cadastrarPlano(req, res) {
    const {
      nome_plano,
      velocidade_download,
      velocidade_upload,
      preco,
      descricao,
      franquia_dados,
      tipo_conexao
    } = req.body;

    const tiposPermitidos = ['fibra', 'rádio', 'cabo', 'satélite'];

    // Verificação de campos obrigatórios
    if (!nome_plano || !velocidade_download || !velocidade_upload || !preco || !tipo_conexao) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios não preenchidos.' });
    }

    // Conversão e validação de números
    const precoNum = Number(preco);
    const downNum = Number(velocidade_download);
    const upNum = Number(velocidade_upload);
    const franquiaNum = franquia_dados !== null && franquia_dados !== undefined && franquia_dados !== '' ? Number(franquia_dados) : null;

    if (isNaN(precoNum) || precoNum <= 0) {
      return res.status(400).json({ success: false, message: 'O preço deve ser um número positivo.' });
    }

    if (isNaN(downNum) || downNum <= 0) {
      return res.status(400).json({ success: false, message: 'A velocidade de download deve ser um número positivo.' });
    }

    if (isNaN(upNum) || upNum <= 0) {
      return res.status(400).json({ success: false, message: 'A velocidade de upload deve ser um número positivo.' });
    }

    if (franquiaNum !== null && (isNaN(franquiaNum) || franquiaNum < 0)) {
      return res.status(400).json({ success: false, message: 'A franquia deve ser um número não negativo ou nula.' });
    }

    // Validação do tipo de conexão
    const tipo = tipo_conexao.toLowerCase();
    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de conexão inválido. Tipos permitidos: ${tiposPermitidos.join(', ')}`
      });
    }

    try {
      const result = await db.query(
        `INSERT INTO planos (
          nome_plano, velocidade_download, velocidade_upload,
          preco, descricao, franquia_dados, tipo_conexao
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_plano`,
        [
          nome_plano.trim(),
          downNum,
          upNum,
          precoNum,
          descricao?.trim() || null,
          franquiaNum,
          tipo
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Plano cadastrado com sucesso.',
        planoId: result.rows[0].id_plano
      });
    } catch (error) {
      console.error('Erro ao cadastrar plano:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar plano no banco de dados.'
      });
    }
  },

  async cadastrarContrato(req, res) {
    const {
      id_cliente,
      id_plano,
      data_inicio,
      data_fim,
      status,
      forma_pagamento,
      observacoes,
      valor_mensal
    } = req.body;

    // Verificação de campos obrigatórios
    if (!id_cliente || !id_plano || !data_inicio || !status || !forma_pagamento || !valor_mensal) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios não preenchidos.' });
    }

    const formasPermitidas = ['boleto', 'cartão', 'pix'];
    const statusPermitidos = ['ativo', 'inativo'];

    const valorNum = Number(valor_mensal);

    if (isNaN(valorNum) || valorNum <= 0) {
      return res.status(400).json({ success: false, message: 'Valor mensal inválido.' });
    }

    if (!formasPermitidas.includes(forma_pagamento.toLowerCase())) {
      return res.status(400).json({ success: false, message: `Forma de pagamento inválida. Permitidas: ${formasPermitidas.join(', ')}` });
    }

    if (!statusPermitidos.includes(status.toLowerCase())) {
      return res.status(400).json({ success: false, message: `Status inválido. Permitidos: ${statusPermitidos.join(', ')}` });
    }

    try {
      const result = await db.query(
        `INSERT INTO contratos (
          id_cliente, id_plano, data_inicio, data_fim,
          status, forma_pagamento, observacoes, valor_mensal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_contrato`,
        [
          id_cliente,
          id_plano,
          data_inicio,
          data_fim || null,
          status.toLowerCase(),
          forma_pagamento.toLowerCase(),
          observacoes?.trim() || null,
          valorNum
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Contrato cadastrado com sucesso.',
        contratoId: result.rows[0].id_contrato
      });
    } catch (error) {
      console.error('Erro ao cadastrar contrato:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar contrato no banco de dados.'
      });
    }
  },

  async cadastrarEquipamento(req, res) {
    const {
      tipo,
      marca,
      modelo,
      numero_serie,
      data_aquisicao,
      status,
      id_cliente
    } = req.body;

    // Verificações básicas
    if (!tipo || !marca || !modelo || !numero_serie || !data_aquisicao || !status || !id_cliente) {
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    const tiposPermitidos = ['roteador', 'modem', 'switch'];
    const statusPermitidos = ['em uso', 'em estoque', 'com defeito'];

    if (!tiposPermitidos.includes(tipo.toLowerCase())) {
      return res.status(400).json({ success: false, message: `Tipo inválido. Permitidos: ${tiposPermitidos.join(', ')}` });
    }

    if (!statusPermitidos.includes(status.toLowerCase())) {
      return res.status(400).json({ success: false, message: `Status inválido. Permitidos: ${statusPermitidos.join(', ')}` });
    }

    try {
      const result = await db.query(
        `INSERT INTO equipamentos (
          tipo, marca, modelo, numero_serie, data_aquisicao, status, id_cliente
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_equipamento`,
        [
          tipo.toLowerCase(),
          marca.trim(),
          modelo.trim(),
          numero_serie.trim(),
          data_aquisicao,
          status.toLowerCase(),
          id_cliente
        ]
      );

      res.status(201).json({ success: true, message: 'Equipamento cadastrado com sucesso.', id: result.rows[0].id_equipamento });
    } catch (error) {
      console.error('Erro ao cadastrar equipamento:', error);
      res.status(500).json({ success: false, message: 'Erro ao cadastrar equipamento.' });
    }
  },

  async cadastrarConexao(req, res) {
    const {
      data_conexao,
      id_cliente,
      id_equipamento,
      ip_publico,
      mac_address,
      velocidade_download,
      velocidade_upload,
      duracao_sessao,
      status
    } = req.body;

    const statusPermitidos = ['conectado', 'desconectado'];

    if (
      !data_conexao || !id_cliente || !id_equipamento || !ip_publico ||
      !mac_address || !velocidade_download || !velocidade_upload ||
      !duracao_sessao || !statusPermitidos.includes(status.toLowerCase())
    ) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios inválidos.' });
    }

    try {
      const result = await db.query(
        `INSERT INTO conexoes (
          data_conexao, id_cliente, id_equipamento, ip_publico, mac_address,
          velocidade_download, velocidade_upload, duracao_sessao, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_conexao`,
        [
          data_conexao,
          id_cliente,
          id_equipamento,
          ip_publico,
          mac_address,
          velocidade_download,
          velocidade_upload,
          duracao_sessao,
          status.toLowerCase()
        ]
      );

      res.status(201).json({ success: true, message: 'Conexão cadastrada com sucesso.', id: result.rows[0].id_conexao });
    } catch (error) {
      console.error('Erro ao cadastrar conexão:', error);
      res.status(500).json({ success: false, message: 'Erro ao cadastrar conexão.' });
    }
  }


};

module.exports = cadastroController;
