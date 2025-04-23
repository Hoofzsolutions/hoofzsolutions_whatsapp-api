# 🟢 HoofzSolutions WhatsApp API

Este projeto conecta uma conta do WhatsApp via Baileys à uma IA personalizada, permitindo automatizar atendimentos para empresas (como academias) através de mensagens recebidas no WhatsApp.

> ⚙️ Backend 100% Node.js + Express  
> 🤖 Integração com IA por Webhook (ex: GPT-3.5)  
> 📦 Deploy na nuvem (Render ou Oracle Cloud)  
> 📲 Suporte para múltiplos chips/empresas no futuro

---

## 📁 Estrutura de Pastas

```bash
hoofzsolutions_whatsapp-api/
├── src/
│   ├── server.js           # Inicia o servidor Express
│   └── whatsapp.js         # Conecta com o WhatsApp via Baileys
├── .env                    # Variáveis sensíveis (URL da IA, porta)
├── .gitignore              # Ignora auth_info/, .env, node_modules
├── package.json            # Dependências e scripts
└── README.md               # Este arquivo
