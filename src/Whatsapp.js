const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require("path");

module.exports = async (nomeSessao) => {
  const pastaSessao = path.join(__dirname, "..", nomeSessao);

  if (!fs.existsSync(pastaSessao)) {
    fs.mkdirSync(pastaSessao, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(pastaSessao);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error instanceof Boom &&
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;

      console.log(`🔌 Conexão encerrada (${nomeSessao}). Reconectando: ${shouldReconnect}`);
      if (shouldReconnect) {
        require("./Whatsapp")(nomeSessao);
      }
    } else if (connection === "open") {
      console.log(`✅ Conectado com sucesso: ${nomeSessao}`);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify" || !messages || !messages[0]) return;

    const msg = messages[0];
    const mensagem = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const numeroCliente = msg.key.remoteJid;

    if (!mensagem || msg.key.fromMe) return;

    console.log(`📩 Mensagem recebida de ${numeroCliente}: ${mensagem}`);

    try {
      const ia = require("../atendimento_ia");
      const resposta = await ia(mensagem, numeroCliente, nomeSessao);
      if (resposta) {
        await sock.sendMessage(numeroCliente, { text: resposta });
      }
    } catch (erro) {
      console.error("Erro no atendimento IA:", erro);
    }
  });
};
