const bcrypt = require('bcrypt');
const db = require('../db'); // ou ajuste o caminho conforme a localização

async function criarAdmin() {
  const email = 'admin@teste.com';
  const senha = 'admin123';
  const tipo = 'admin';

  const hash = await bcrypt.hash(senha, 10);

  try {
    await db.query(
      'INSERT INTO usuarios (email, senha, tipo) VALUES ($1, $2, $3)',
      [email, hash, tipo]
    );
    console.log('Usuário admin criado com sucesso!');
  } catch (err) {
    console.error('Erro ao criar usuário admin:', err);
  } finally {
    process.exit();
  }
}

criarAdmin();
