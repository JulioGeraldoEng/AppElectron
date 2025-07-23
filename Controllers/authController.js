const bcrypt = require('bcrypt');
const db = require('../db');

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

    // Aqui alterei para salvar o objeto na sessão com a chave 'usuario' e incluir tipo
    req.session.usuario = { id: user.id, tipo: user.tipo, email: user.email };
    console.log('Login bem-sucedido:', req.session.usuario); // debug
    res.json({ success: true, tipo: user.tipo });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
}

function logout(req, res) {
  req.session.destroy(err => {
    if (err) {
      console.error('Erro ao encerrar sessão:', err);
      return res.status(500).json({ success: false, message: 'Erro ao sair.' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
}

module.exports = {
  login,
  logout
};
