const bcrypt = require('bcrypt');
const db = require('../db');

const cadastroController = {
  async cadastrarFuncionario(req, res) {
    const { email, senha, nome, cargo, telefone } = req.body;

    if (!email || !senha || !nome) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios não preenchidos.' });
    }

    try {
      // Verifica se e-mail já está cadastrado
      const existe = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
      if (existe.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'E-mail já cadastrado.' });
      }

      // Criptografa a senha
      const hash = await bcrypt.hash(senha, 10);

      // Insere na tabela de usuários
      const novoUsuario = await db.query(
        'INSERT INTO usuarios (email, senha, tipo) VALUES ($1, $2, $3) RETURNING id',
        [email, hash, 'funcionario']
      );

      const usuarioId = novoUsuario.rows[0].id;

      // Insere na tabela de funcionários
      await db.query(
        'INSERT INTO funcionarios (usuario_id, nome, cargo, telefone) VALUES ($1, $2, $3, $4)',
        [usuarioId, nome, cargo || null, telefone || null]
      );

      return res.status(201).json({ success: true, message: 'Funcionário cadastrado com sucesso.' });
    } catch (error) {
      console.error('Erro ao cadastrar funcionário:', error);
      return res.status(500).json({ success: false, message: 'Erro ao cadastrar funcionário.' });
    }
  },

  async cadastrarAdmin(req, res) {
    const { email, senha, nome, telefone } = req.body;

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
        'INSERT INTO admins (usuario_id, nome, telefone) VALUES ($1, $2, $3)',
        [usuarioId, nome, telefone || null]
      );

      return res.status(201).json({ success: true, message: 'Administrador cadastrado com sucesso.' });
    } catch (error) {
      console.error('Erro ao cadastrar admin:', error);
      return res.status(500).json({ success: false, message: 'Erro ao cadastrar administrador.' });
    }
  },

  async cadastrarCliente(req, res) {
    const { email, senha, nome, cpf, endereco, telefone } = req.body;

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
        'INSERT INTO clientes (usuario_id, nome, cpf, endereco, telefone) VALUES ($1, $2, $3, $4, $5)',
        [usuarioId, nome, cpf || null, endereco || null, telefone || null]
      );

      return res.status(201).json({ success: true, message: 'Cliente cadastrado com sucesso.' });
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      return res.status(500).json({ success: false, message: 'Erro ao cadastrar cliente.' });
    }
  }
};

module.exports = cadastroController;
