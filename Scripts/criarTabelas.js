const db = require('../db'); // Ajuste o caminho conforme seu projeto

async function criarTabelas() {
  try {
    // Tabela principal de usuários
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        tipo TEXT NOT NULL CHECK (tipo IN ('admin', 'funcionario', 'cliente'))
      );
    `);

    // Tabela admins
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER UNIQUE NOT NULL,
        nome TEXT NOT NULL,
        telefone TEXT,
        CONSTRAINT fk_admin_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `);

    // Tabela funcionários
    await db.query(`
      CREATE TABLE IF NOT EXISTS funcionarios (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER UNIQUE NOT NULL,
        nome TEXT NOT NULL,
        cargo TEXT,
        telefone TEXT,
        CONSTRAINT fk_funcionario_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `);

    // Tabela clientes
    await db.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER UNIQUE NOT NULL,
        nome TEXT NOT NULL,
        cpf TEXT UNIQUE,
        endereco TEXT,
        telefone TEXT,
        CONSTRAINT fk_cliente_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `);

    console.log('✅ Todas as tabelas foram criadas com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao criar as tabelas:', err);
  } finally {
    process.exit();
  }
}

criarTabelas();