require("dotenv").config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const axios = require("axios");

const IA_API_URL = process.env.IA_API_URL;
console.log("🔗 Endpoint da IA carregado:", IA_API_URL);

async function startWhatsApp(sockCallback) {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    browser: ["HoofzSolutions", "Desktop", "1.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify" || !messages.length) return;

    const msg = messages[0];

    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (!textMessage || sender.endsWith("@g.us")) return;

    console.log(`📩 Mensagem recebida de ${sender}: "${textMessage}"`);

    try {
      const sender = msg.key.remoteJid;
      const senderNormalized = sender.replace(/@s\.whatsapp\.net$/, "@c.us");

      const response = await axios.post(IA_API_URL, {
        mensagem: textMessage,
        cliente_id: senderNormalized,
      });

      if (response.data?.resposta) {
        console.log(`🤖 Resposta da IA: "${response.data.resposta}"`);
        await sock.sendMessage(sender, { text: response.data.resposta });
      } else {
        console.warn("⚠️ A IA não retornou resposta.");
      }
    } catch (err) {
      console.error("❌ Erro ao se comunicar com a IA:", err.message);
      if (err.response?.data) {
        console.error("Detalhes do erro:", err.response.data);
      }
      await sock.sendMessage(sender, { text: "⚠️ Erro ao acessar a IA." });
    }
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("❌ Conexão encerrada. Reconectando:", shouldReconnect);
      if (shouldReconnect) startWhatsApp(sockCallback);
    } else if (connection === "open") {
      console.log("✅ Conectado ao WhatsApp com sucesso!");
    }
  });

  if (sockCallback) sockCallback(sock);
}

module.exports = startWhatsApp;
