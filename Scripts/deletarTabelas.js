const db = require('../db');

async function deletarTabelas() {
  try {
    // Ordem reversa para evitar erros de dependência
    await db.query('DROP TABLE IF EXISTS clientes CASCADE');
    await db.query('DROP TABLE IF EXISTS funcionarios CASCADE');
    await db.query('DROP TABLE IF EXISTS admins CASCADE');
    await db.query('DROP TABLE IF EXISTS usuarios CASCADE');

    console.log('Todas as tabelas foram deletadas com sucesso.');
  } catch (err) {
    console.error('Erro ao deletar tabelas:', err);
  } finally {
    process.exit();
  }
}

deletarTabelas();