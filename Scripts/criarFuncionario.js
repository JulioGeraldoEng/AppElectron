const bcrypt = require('bcrypt');
const db = require('../db'); // ou ajuste o caminho conforme a localização

async function criarFuncionario() {
  const email = 'funcionario@teste.com';
  const senha = 'funcionario123';
  const tipo = 'funcionario';

  const hash = await bcrypt.hash(senha, 10);

  try {
    await db.query(
      'INSERT INTO usuarios (email, senha, tipo) VALUES ($1, $2, $3)',
      [email, hash, tipo]
    );
    console.log('Usuário funcionario criado com sucesso!');
  } catch (err) {
    console.error('Erro ao criar usuário funcionario:', err);
  } finally {
    process.exit();
  }
}

criarFuncionario();
