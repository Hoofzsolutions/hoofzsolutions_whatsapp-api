require("dotenv").config(); // 👈 Carrega as variáveis do .env

// Importações necessárias
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("baileys");
const axios = require("axios");
const { Boom } = require("@hapi/boom");

// URL da sua API de IA (vem do .env)
const IA_API_URL = process.env.IA_API_URL;
console.log("🔗 Endpoint da IA carregado:", IA_API_URL);

async function startWhatsApp(sockCallback) {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    browser: ["HoofzSolutions", "Chrome", "1.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type === "notify") {
      const msg = messages[0];
      const sender = msg.key.remoteJid;

      if (!msg.key.fromMe && msg.message?.conversation && !sender.endsWith("@g.us")) {
        const text = msg.message.conversation;

        console.log(`📩 Mensagem recebida de ${sender}: "${text}"`);

        try {
          const senderNormalized = sender.replace("@s.whatsapp.net", "@c.us");
          const response = await axios.post(IA_API_URL, {
            mensagem: text,
            cliente_id: sender,
          });

          if (response.data?.resposta) {
            console.log(`🤖 Resposta da IA: "${response.data.resposta}"`);
            await sock.sendMessage(sender, { text: response.data.resposta });
          } else {
            console.warn("⚠️ A IA não retornou uma resposta.");
          }
        } catch (err) {
          console.error("❌ Erro ao se comunicar com a IA:", err.message);
          if (err.response) {
            console.error("Detalhes do erro:", err.response.data);
          }
          await sock.sendMessage(sender, { text: "⚠️ Erro ao acessar a IA." });
        }
      }
    }
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Conexão encerrada. Reconectando:", shouldReconnect);
      if (shouldReconnect) startWhatsApp(sockCallback);
    } else if (connection === "open") {
      console.log("✅ Conectado ao WhatsApp com sucesso!");
    }
  });

  if (sockCallback) sockCallback(sock);
}

module.exports = startWhatsApp;
