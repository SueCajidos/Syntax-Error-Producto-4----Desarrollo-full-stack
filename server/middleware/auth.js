const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // <--- necesario
    } catch (err) {
      console.error('❌ Token inválido:', err.message);
    }
  } else {
    //console.warn('⚠️ No se encontró header Authorization válido');
  }

  next();
};

module.exports = authMiddleware;
