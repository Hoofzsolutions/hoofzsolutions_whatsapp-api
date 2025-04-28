const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { exec } = require('child_process');

const pastaAuth = path.join(__dirname, 'auth_info');
const destinoBackup = path.join(__dirname, 'storage', 'backup_auth_info.zip');

// Garante que a pasta storage exista
if (!fs.existsSync(path.join(__dirname, 'storage'))) {
  fs.mkdirSync(path.join(__dirname, 'storage'));
}

// Tarefa agendada: todo dia às 03h da manhã
cron.schedule('0 3 * * *', () => {
  console.log('🔄 Fazendo backup da pasta auth_info...');
  
  exec(`zip -r ${destinoBackup} ${pastaAuth}`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erro ao criar backup:', error.message);
      return;
    }
    console.log('✅ Backup da auth_info criado com sucesso!');
  });
});

console.log('🚀 Agendador de backup rodando...');
