function autenticar(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ message: 'Usuário não autenticado.' });
}

function autorizar(tipo) {
  return (req, res, next) => {
    if (req.session.user && req.session.user.tipo === tipo) {
      return next();
    }
    res.status(403).json({ message: 'Acesso negado.' });
  };
}

module.exports = {
  autenticar,
  autorizar,
};
