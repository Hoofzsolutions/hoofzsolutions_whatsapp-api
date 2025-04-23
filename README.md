# HoofzSolutions WhatsApp API 🤖💬

Sistema de atendimento automatizado via WhatsApp com inteligência artificial, utilizando Baileys + Node.js + API personalizada.

## 🚀 Visão Geral
Este projeto permite:
- Conectar múltiplos números de WhatsApp com Baileys.
- Responder mensagens automaticamente usando uma API de IA.
- Rodar tudo localmente ou na nuvem (Render ou Oracle Cloud).

Ideal para academias, empresas locais ou qualquer negócio que precise de atendimento automatizado inteligente.

---

## 📁 Estrutura de Diretórios
```
├── index.js                 # Código principal de conexão com Baileys
├── auth_info/              # Dados de autenticação do número (criado após scan do QR code)
├── package.json            # Dependências e scripts do projeto
├── .env                    # Variáveis de ambiente (opcional)
└── README.md               # Este arquivo
```

---

## 🧠 API de IA
O projeto se comunica com uma API externa para gerar respostas com inteligência artificial.

Endpoint utilizado:
```
POST https://hoofzsolutions-whatsapp-ia-api.onrender.com/webhook
```

Payload enviado:
```json
{
  "mensagem": "Texto recebido do cliente",
  "cliente_id": "5511999999999@c.us"
}
```

Resposta esperada:
```json
{
  "resposta": "Texto gerado pela IA"
}
```

---

## 🛠️ Como Rodar Localmente
1. Clone o repositório:
```bash
git clone https://github.com/Hoofzsolutions/hoofzsolutions_whatsapp-api.git
cd hoofzsolutions_whatsapp-api
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o sistema e escaneie o QR code com seu WhatsApp:
```bash
node index.js
```

---

## ☁️ Deploy na Nuvem (Render)
> **Importante**: o Baileys só funciona com WebSocket em servidores que mantêm sessões abertas (como Oracle Cloud, VPS, etc). Render **não** suporta Baileys diretamente.

Para deixar o sistema na nuvem com IA:
1. Crie um servidor na [Oracle Cloud Free Tier](https://www.oracle.com/br/cloud/free/)
2. Instale Node.js no servidor
3. Clone seu repositório e rode `node index.js`
4. Deixe o processo rodando com `pm2` ou `screen`

---

## 📌 Futuro do Projeto
- Suporte a múltiplos clientes simultâneos (multitenancy)
- Dashboard para gerenciar números, mensagens e leads
- Banco de dados para histórico e funil de vendas

---

## 📞 Contato
Desenvolvido por [HoofzSolutions](https://github.com/Hoofzsolutions) 🚀

Entre em contato no WhatsApp para parcerias e soluções personalizadas!

