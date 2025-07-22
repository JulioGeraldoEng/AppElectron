const userModel = require('../Models/userModel');
const bcrypt = require('bcrypt');

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email ou senha inválidos.' });
    }

    const senhaValida = await bcrypt.compare(password, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ success: false, message: 'Email ou senha inválidos.' });
    }

    req.session.usuario = {
      id: user.id,
      nome: user.nome,
      tipo: user.tipo,
      email: user.email
    };

    return res.json({ success: true, tipo: user.tipo });
  } catch (err) {
    console.error('Erro ao tentar login:', err);
    return res.status(500).json({ success: false, message: 'Erro interno.' });
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.json({ success: true });
  });
}

module.exports = {
  login,
  logout,
};
