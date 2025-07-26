require('dotenv').config();
const bcrypt = require('bcrypt');

// ... (já deve ter isso no topo do seu arquivo)

const adminsIds = [];

async function seedAdmin() {
  const emailAdmin = process.env.ADMIN_EMAIL;
  const senhaAdmin = process.env.ADMIN_SENHA;
  const nomeAdmin = process.env.ADMIN_NOME || 'Administrador Principal';
  const telefoneAdmin = process.env.ADMIN_TELEFONE || null;

  if (!emailAdmin || !senhaAdmin) {
    throw new Error('ADMIN_EMAIL ou ADMIN_SENHA não definidos no .env');
  }

  const senhaHash = await bcrypt.hash(senhaAdmin, 10);

  const existing = await pool.query(
    'SELECT u.id, a.id_admin FROM usuarios u JOIN admins a ON u.id = a.usuario_id WHERE u.email = $1',
    [emailAdmin]
  );

  if (existing.rowCount === 0) {
    const newUser = await pool.query(
      'INSERT INTO usuarios (email, senha, tipo) VALUES ($1, $2, $3) RETURNING id',
      [emailAdmin, senhaHash, 'admin']
    );
    const usuarioId = newUser.rows[0].id;

    const newAdmin = await pool.query(
      'INSERT INTO admins (usuario_id, nome, telefone) VALUES ($1, $2, $3) RETURNING id_admin',
      [usuarioId, nomeAdmin, telefoneAdmin]
    );

    adminsIds.push(usuarioId); // usamos usuario_id para vincular com notificações, logins, etc.
    console.log('✅ Admin criado com sucesso!');
  } else {
    adminsIds.push(existing.rows[0].id); // já existe, adiciona à lista
    console.log('⚠️ Admin já existe. Usando ID existente.');
  }
}
