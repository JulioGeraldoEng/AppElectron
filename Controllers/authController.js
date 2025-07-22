const userModel = require('../models/userModel');

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await userModel.findUserByEmailAndPassword(email, password);

    if (user) {
      // Armazena os dados do usuário na sessão
      req.session.usuario = {
        id: user.id,
        nome: user.nome,
        tipo: user.tipo,
        email: user.email
      };
      return res.json({ success: true, tipo: user.tipo }); // pode enviar o tipo para controle de permissões
    }

    // Caso não encontre usuário ou senha incorreta
    return res.status(401).json({ success: false, message: 'Email ou senha inválidos.' });
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
