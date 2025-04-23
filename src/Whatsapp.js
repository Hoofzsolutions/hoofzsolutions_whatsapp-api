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

async function startWhatsApp(sockCallback) {
  // Estado de autenticação (salva arquivos em 'auth_info')
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  // Busca a versão mais recente compatível do WhatsApp Web
  const { version } = await fetchLatestBaileysVersion();

  // Cria o socket (conexão com o WhatsApp)
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true, // Mostra o QR code no terminal
    browser: ["HoofzSolutions", "Chrome", "1.0.0"], // Identificação do dispositivo
  });

  // Salva credenciais sempre que forem atualizadas
  sock.ev.on("creds.update", saveCreds);

  // Escuta por novas mensagens
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type === "notify") {
      const msg = messages[0];
      const sender = msg.key.remoteJid;
  
      if (!msg.key.fromMe && msg.message?.conversation && !sender.endsWith("@g.us")) {
        const text = msg.message.conversation;
  
        console.log(`📩 Mensagem recebida de ${sender}: "${text}"`);
  
        try {
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
          await sock.sendMessage(sender, { text: "⚠️ Erro ao acessar a IA." });
        }
      }
    }
  });

  // Atualização da conexão com o WhatsApp
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

  // Se quiser passar o socket pra fora
  if (sockCallback) sockCallback(sock);
}

module.exports = startWhatsApp;
