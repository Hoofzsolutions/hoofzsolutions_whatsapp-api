const express = require("express");
const dotenv = require("dotenv");
const startWhatsApp = require("./src/Whatsapp"); // <-- aqui tava o erro

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

startWhatsApp();

app.get("/", (req, res) => {
  res.send("API do WhatsApp Online ✅");
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
