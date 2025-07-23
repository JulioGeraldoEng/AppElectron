const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token ausente.' });

  const token = authHeader.split(' ')[1]; // Espera 'Bearer <token>'
  if (!token) return res.status(401).json({ message: 'Token mal formatado.' });

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ message: 'Token inválido.' });
    req.usuario = usuario; // { id, email, tipo }
    next();
  });
}

function autorizar(tipo) {
  return (req, res, next) => {
    if (req.usuario && req.usuario.tipo === tipo) {
      return next();
    }
    res.status(403).json({ message: 'Acesso negado.' });
  };
}

module.exports = {
  autenticar,
  autorizar,
};
