//./src/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const { loginUser, registerUser } = require("../controllers/authController"); // Importamos las funciones
const { verifyToken } = require("../services/authService"); // Importar el verificador de tokens

// Ruta para el login
router.post("/login", loginUser);

// Ruta para el registro
router.post("/register", registerUser); // Nueva ruta para registrar usuarios

router.get("/verify", (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    verifyToken(token);
    res.sendStatus(200);
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
});

module.exports = router;
