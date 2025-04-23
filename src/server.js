// Importando os módulos necessários
const express = require("express");
const dotenv = require("dotenv");
const startWhatsApp = require("./Whatsapp"); // ✅ Importa e inicia a conexão com o WhatsApp via Baileys

// Carrega variáveis de ambiente do .env
dotenv.config();

// Inicializa o Express
const app = express();
const PORT = process.env.PORT || 3000; // Define a porta do servidor

// Middleware para permitir receber JSON nas requisições
app.use(express.json());

// Inicia a conexão com o WhatsApp (Baileys)
startWhatsApp();

// Rota principal apenas para ver se a API está no ar
app.get("/", (req, res) => {
  res.send("API do WhatsApp Online ✅");
});

// Inicia o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
