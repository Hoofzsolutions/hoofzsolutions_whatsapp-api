const express = require("express");
const dotenv = require("dotenv");
const startTodasSessoes = require("./startTodasSessoes"); // inicia todas as sessões

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

startTodasSessoes(); // inicia todas as sessões automaticamente

app.get("/", (req, res) => {
  res.send("API do WhatsApp Multiempresa Online ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
