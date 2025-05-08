const startSessao = require("./Whatsapp");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  const pastas = ["supermercado_silva", "vittal_academia"];

  for (const pasta of pastas) {
    console.log("\n===============================");
    console.log(`🟡 Escaneie o QR Code para: ${pasta.toUpperCase()}`);
    console.log("===============================\n");

    await startSessao(pasta);
    await delay(10000);
  }
})();
