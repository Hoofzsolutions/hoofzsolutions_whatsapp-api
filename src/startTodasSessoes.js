const fs = require("fs");
const startSessao = require("./Whatsapp");

const sessoes = JSON.parse(fs.readFileSync("sessoes.json", "utf8"));

sessoes.forEach(sessao => {
  console.log(`🟢 Iniciando sessão para ${sessao.empresaId}...`);
  startSessao(sessao.authFolder);
});
