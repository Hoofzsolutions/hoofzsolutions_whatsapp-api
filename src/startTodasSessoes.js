const start = require("./Whatsapp");
const fs = require("fs");

// Lê o arquivo sessoes.json
const sessoes = JSON.parse(fs.readFileSync("./sessoes.json", "utf-8"));

sessoes.forEach(async (nomeSessao) => {
  try {
    console.log(`🔄 Iniciando sessão: ${nomeSessao}`);
    await start(nomeSessao);
  } catch (error) {
    console.error(`❌ Erro ao iniciar sessão ${nomeSessao}:`, error);
  }
});
