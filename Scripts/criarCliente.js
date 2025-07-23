const bcrypt = require('bcrypt');
const db = require('../db'); // ou ajuste o caminho conforme a localização

async function criarCliente() {
  const email = 'cliente@teste.com';
  const senha = 'cliente123';
  const tipo = 'cliente';

  const hash = await bcrypt.hash(senha, 10);

  try {
    await db.query(
      'INSERT INTO usuarios (email, senha, tipo) VALUES ($1, $2, $3)',
      [email, hash, tipo]
    );
    console.log('Usuário cliente criado com sucesso!');
  } catch (err) {
    console.error('Erro ao criar usuário cliente:', err);
  } finally {
    process.exit();
  }
}

criarCliente();
