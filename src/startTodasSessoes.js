const { startSessao } = require("./Whatsapp");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  const pastas = ["supermercado_silva", "vittal_academia"];

  for (const pasta of pastas) {
    console.log("\n===============================");
    console.log(`🟡 Escaneie o QR Code para: ${pasta.toUpperCase()}`);
    console.log("===============================\n");

    try {
      await startSessao(pasta);
    } catch (err) {
      console.error(`❌ Erro ao iniciar sessão para ${pasta}:`, err.message);
    }

    // Tempo para escanear QR antes da próxima sessão
    await delay(15000); // você pode aumentar se necessário
  }
})();
