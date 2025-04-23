const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
  } = require("baileys");
  
  const { Boom } = require("@hapi/boom");
  const axios = require("axios");
  const express = require("express");
  const fs = require("fs");
  const app = express();
  
  app.use(express.json());
  
  const IA_API_URL = "https://hoofzsolutions-whatsapp-ia-api.onrender.com/webhook";
  
  async function connectToWhatsApp() {
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
        if (!msg.key.fromMe && msg.message?.conversation) {
          const text = msg.message.conversation;
          const sender = msg.key.remoteJid;
  
          try {
            const response = await axios.post(IA_API_URL, {
              mensagem: text,
              cliente_id: sender,
            });
  
            if (response.data?.resposta) {
              await sock.sendMessage(sender, { text: response.data.resposta });
            }
          } catch (err) {
            console.error("Erro ao se comunicar com a IA:", err.message);
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
        if (shouldReconnect) connectToWhatsApp();
      } else if (connection === "open") {
        console.log("✅ Conectado ao WhatsApp com sucesso!");
      }
    });
  }
  
  connectToWhatsApp();
  