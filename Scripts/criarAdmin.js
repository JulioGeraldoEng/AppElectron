require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../db');

async function criarAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_SENHA;
  const nome = process.env.ADMIN_NOME;
  const telefone = process.env.ADMIN_TELEFONE;

  if (!email || !senha || !nome) {
    console.error('❌ ADMIN_EMAIL, ADMIN_SENHA e ADMIN_NOME devem estar definidos no .env');
    process.exit(1);
  }

  try {
    // Verifica se o usuário admin já existe
    const existeUsuario = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);

    let usuarioId;

    if (existeUsuario.rows.length > 0) {
      usuarioId = existeUsuario.rows[0].id;
      console.log('⚠️ Usuário admin já existe na tabela usuarios. Usando o ID existente:', usuarioId);
    } else {
      // Cria o usuário admin
      const hash = await bcrypt.hash(senha, 10);
      const resultadoInsert = await db.query(
        'INSERT INTO usuarios (email, senha, tipo) VALUES ($1, $2, $3) RETURNING id',
        [email, hash, 'admin']
      );
      usuarioId = resultadoInsert.rows[0].id;
      console.log('✅ Usuário admin criado com sucesso! ID:', usuarioId);
    }

    // Verifica se já existem dados na tabela admins para esse usuário
    const existeAdmin = await db.query('SELECT * FROM admins WHERE usuario_id = $1', [usuarioId]);

    if (existeAdmin.rows.length > 0) {
      console.log('⚠️ Dados do admin já existem na tabela admins. Nenhuma ação foi realizada.');
    } else {
      // Insere os dados na tabela admins
      await db.query(
        'INSERT INTO admins (usuario_id, nome, telefone) VALUES ($1, $2, $3)',
        [usuarioId, nome, telefone || null]
      );
      console.log('✅ Dados adicionais do admin criados com sucesso!');
    }
  } catch (err) {
    console.error('❌ Erro ao criar admin:', err);
  } finally {
    process.exit();
  }
}

criarAdmin();