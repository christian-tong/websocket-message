//./src/middleware/authMiddleware.js
const { verifyToken } = require("../services/authService");

const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = verifyToken(token.replace("Bearer ", ""));
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

module.exports = authenticate;
