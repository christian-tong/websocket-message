require("dotenv").config(); // Cargar las variables de entorno

const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");

app.use(express.json());

app.use("/api", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
