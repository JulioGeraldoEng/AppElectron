function autenticar(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  res.status(401).json({ message: 'Usuário não autenticado.' });
}

function autorizar(tipo) {
  return (req, res, next) => {
    if (req.session.usuario && req.session.usuario.tipo === tipo) {
      return next();
    }
    res.status(403).json({ message: 'Acesso negado.' });
  };
}

module.exports = {
  autenticar,
  autorizar,
};
