const db = require('./db'); // Certifique-se de que o nome do arquivo da conexão está correto

db.query('SELECT * FROM usuarios', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
  } else {
    console.log('Usuários cadastrados:', res.rows);
  }
});
