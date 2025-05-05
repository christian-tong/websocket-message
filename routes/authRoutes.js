const express = require("express");
const router = express.Router();
const { loginUser, registerUser } = require("../controllers/authController"); // Importamos las funciones

// Ruta para el login
router.post("/login", loginUser);

// Ruta para el registro
router.post("/register", registerUser); // Nueva ruta para registrar usuarios

module.exports = router;
