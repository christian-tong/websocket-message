const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/authController"); // Asegúrate de que esta importación sea correcta

router.post("/login", loginUser); // Esta ruta debe estar asociada al controlador loginUser

module.exports = router;
