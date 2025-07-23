require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../db');

async function criarCliente() {
  const email = process.env.CLIENTE_EMAIL;
  const senha = process.env.CLIENTE_SENHA;
  const nome = process.env.CLIENTE_NOME;
  const cpf = process.env.CLIENTE_CPF;
  const endereco = process.env.CLIENTE_ENDERECO;
  const telefone = process.env.CLIENTE_TELEFONE;

  if (!email || !senha || !nome) {
    console.error('❌ CLIENTE_EMAIL, CLIENTE_SENHA e CLIENTE_NOME devem estar definidos no .env');
    process.exit(1);
  }

  try {
    // Verifica se usuário já existe
    const existeUsuario = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    let usuarioId;

    if (existeUsuario.rows.length > 0) {
      usuarioId = existeUsuario.rows[0].id;
      console.log('⚠️ Usuário cliente já existe na tabela usuarios. Usando o ID existente:', usuarioId);
    } else {
      // Cria usuário cliente
      const hash = await bcrypt.hash(senha, 10);
      const resultadoInsert = await db.query(
        'INSERT INTO usuarios (email, senha, tipo) VALUES ($1, $2, $3) RETURNING id',
        [email, hash, 'cliente']
      );
      usuarioId = resultadoInsert.rows[0].id;
      console.log('✅ Usuário cliente criado com sucesso! ID:', usuarioId);
    }

    // Verifica se já existem dados na tabela clientes para esse usuário
    const existeCliente = await db.query('SELECT * FROM clientes WHERE usuario_id = $1', [usuarioId]);

    if (existeCliente.rows.length > 0) {
      console.log('⚠️ Dados do cliente já existem na tabela clientes. Nenhuma ação foi realizada.');
    } else {
      // Insere dados na tabela clientes
      await db.query(
        'INSERT INTO clientes (usuario_id, nome, cpf, endereco, telefone) VALUES ($1, $2, $3, $4, $5)',
        [usuarioId, nome, cpf || null, endereco || null, telefone || null]
      );
      console.log('✅ Dados adicionais do cliente criados com sucesso!');
    }
  } catch (err) {
    console.error('❌ Erro ao criar cliente:', err);
  } finally {
    process.exit();
  }
}

criarCliente();