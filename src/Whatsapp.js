const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const axios = require("axios");
const empresas = require("../empresas.json");
require("dotenv").config();

async function startSessao(authFolder) {
  const { state, saveCreds } = await useMultiFileAuthState(`./${authFolder}`);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    browser: ["Hoofz Multi", "Desktop", "1.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  const contextoPorCliente = {};
  const numeroSessao = sock.user.id;
  const empresaId = empresas[numeroSessao] || "desconhecida";

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify" || !messages.length) return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!textMessage || sender.endsWith("@g.us")) return;

    const contextoAtual = contextoPorCliente[sender] || {};

    try {
      const resposta = await axios.post(`${process.env.IA_API_URL}/webhook`, {
        mensagem: textMessage,
        numeroCliente: sender,
        contexto: contextoAtual,
        empresaId
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

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const motivo = lastDisconnect?.error?.output?.statusCode;
      if (motivo !== DisconnectReason.loggedOut) {
        startSessao(authFolder);
      }
    } else if (connection === "open") {
      console.log(`✅ [${empresaId}] Conectado como ${numeroSessao}`);
    }
  });
}

module.exports = startSessao;
