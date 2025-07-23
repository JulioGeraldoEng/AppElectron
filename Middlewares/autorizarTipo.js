// Middlewares/autorizarTipo.js

function autorizarTipo(...tiposPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !tiposPermitidos.includes(req.usuario.tipo)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado: você não tem permissão para acessar esta rota.'
      });
    }
    next();
  };
}

module.exports = autorizarTipo;
