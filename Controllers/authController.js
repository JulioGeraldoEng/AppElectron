require('dotenv').config();  // Carrega as variáveis do .env
const bcrypt = require('bcrypt');
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
    }

    if (!user.senha) {
      console.error('Senha ausente no banco.');
      return res.status(500).json({ success: false, message: 'Senha não registrada.' });
    }

    const match = await bcrypt.compare(password, user.senha);

    if (!match) {
      return res.status(401).json({ success: false, message: 'Senha incorreta.' });
    }

    // Gerar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      success: true,
      message: 'Login bem-sucedido.',
      token,
      tipo: user.tipo
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
}

// Logout apenas responde sucesso, o cliente deve apagar o token localmente
function logout(req, res) {
  res.json({ success: true, message: 'Logout realizado com sucesso (cliente).' });
}

module.exports = {
  login,
  logout
};
