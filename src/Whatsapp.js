const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const axios = require("axios");
require("dotenv").config();

async function startSessao(authFolder) {
  const { state, saveCreds } = await useMultiFileAuthState(`./${authFolder}`);
  const { version } = await fetchLatestBaileysVersion();

  console.log(`\n🔐 Iniciando conexão para: ${authFolder.toUpperCase()}...`);

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    browser: [authFolder.toUpperCase(), "Desktop", "1.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  const contextoPorCliente = {};

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`🔌 [${authFolder}] Conexão encerrada. Reconectar? ${shouldReconnect}`);
      if (shouldReconnect) startSessao(authFolder);
    }

    if (connection === "open") {
      const numeroSessao = sock.user.id.split(":")[0];
      const empresasMapeadas = require("../empresas.json");
      const empresaId = empresasMapeadas[numeroSessao] || "desconhecida";
      console.log(`✅ [${empresaId}] Conectado como ${sock.user.id}`);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify" || !messages.length) return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!textMessage || sender.endsWith("@g.us")) return;

    const contextoAtual = contextoPorCliente[sender] || {};

    // pega o número da sessão correta para buscar a empresa no JSON
    const numeroSessao = sock.user.id.split(":")[0];
    const empresasMapeadas = require("../empresas.json");
    const empresaId = empresasMapeadas[numeroSessao] || "desconhecida";

    console.log(`[${empresaId}] ➜ Enviando para IA: ${process.env.IA_API_URL}/webhook`);

    try {
      const resposta = await axios.post(`${process.env.IA_API_URL}/webhook`, {
        mensagem: textMessage,
        numeroCliente: sender,
        contexto: contextoAtual,
        empresaId,
      });

      const dados = resposta.data;
      if (dados?.mensagem) {
        contextoPorCliente[sender] = dados.contexto || {};
        await sock.sendMessage(sender, { text: dados.mensagem });
      }
    } catch (err) {
      console.error(`[${empresaId}] ❌ Erro ao responder:`, err.message);
      await sock.sendMessage(sender, { text: "⚠️ Erro ao processar. Tente novamente." });
    }
  });
}

module.exports = { startSessao };
