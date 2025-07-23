// Middlewares/verificarToken.js

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Espera algo como: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuarioDecodificado) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido ou expirado.' });
    }

    // Injeta os dados do usuário decodificados no req
    req.usuario = usuarioDecodificado;
    next();
  });
}

module.exports = verificarToken;
