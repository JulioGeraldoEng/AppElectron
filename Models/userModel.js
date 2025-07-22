const bcrypt = require('bcrypt');
const db = require('../db');

async function findUserByEmail(email) {
  const query = 'SELECT * FROM usuarios WHERE email = $1';
  const values = [email];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function criarUsuario(email, senhaPlain) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(senhaPlain, saltRounds);
  await db.query('INSERT INTO usuarios (email, senha) VALUES ($1, $2)', [email, hash]);
}

module.exports = {
  findUserByEmail,
  criarUsuario,
};
