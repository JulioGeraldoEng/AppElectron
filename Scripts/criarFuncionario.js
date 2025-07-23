require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../db');

async function criarFuncionario() {
  const email = process.env.FUNCIONARIO_EMAIL;
  const senha = process.env.FUNCIONARIO_SENHA;
  const nome = process.env.FUNCIONARIO_NOME;
  const cargo = process.env.FUNCIONARIO_CARGO;
  const telefone = process.env.FUNCIONARIO_TELEFONE;

  if (!email || !senha || !nome) {
    console.error('❌ FUNCIONARIO_EMAIL, FUNCIONARIO_SENHA e FUNCIONARIO_NOME devem estar definidos no .env');
    process.exit(1);
  }

  try {
    // Verifica se usuário já existe
    const existeUsuario = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    let usuarioId;

    if (existeUsuario.rows.length > 0) {
      usuarioId = existeUsuario.rows[0].id;
      console.log('⚠️ Usuário funcionário já existe na tabela usuarios. Usando o ID existente:', usuarioId);
    } else {
      // Cria usuário funcionário
      const hash = await bcrypt.hash(senha, 10);
      const resultadoInsert = await db.query(
        'INSERT INTO usuarios (email, senha, tipo) VALUES ($1, $2, $3) RETURNING id',
        [email, hash, 'funcionario']
      );
      usuarioId = resultadoInsert.rows[0].id;
      console.log('✅ Usuário funcionário criado com sucesso! ID:', usuarioId);
    }

    // Verifica se já existem dados na tabela funcionarios para esse usuário
    const existeFuncionario = await db.query('SELECT * FROM funcionarios WHERE usuario_id = $1', [usuarioId]);

    if (existeFuncionario.rows.length > 0) {
      console.log('⚠️ Dados do funcionário já existem na tabela funcionarios. Nenhuma ação foi realizada.');
    } else {
      // Insere dados na tabela funcionarios
      await db.query(
        'INSERT INTO funcionarios (usuario_id, nome, cargo, telefone) VALUES ($1, $2, $3, $4)',
        [usuarioId, nome, cargo || null, telefone || null]
      );
      console.log('✅ Dados adicionais do funcionário criados com sucesso!');
    }
  } catch (err) {
    console.error('❌ Erro ao criar funcionário:', err);
  } finally {
    process.exit();
  }
}

criarFuncionario();