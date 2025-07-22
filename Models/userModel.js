const db = require('../db');

async function findUserByEmailAndPassword(email, password) {
  const query = 'SELECT * FROM usuarios WHERE email = $1 AND senha = $2';
  const values = [email, password];
  const result = await db.query(query, values);
  return result.rows[0]; // retorna o usuário encontrado ou undefined
}

module.exports = {
  findUserByEmailAndPassword,
};
