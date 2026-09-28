require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { REST, Routes } = require('discord.js');
const fs   = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const cmd = require(path.join(commandsPath, file));
  if (cmd.data) commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🔄 ${commands.length} slash komut kaydediliyor...`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('✅ Slash komutlar başarıyla kaydedildi!');
  } catch (err) {
    console.error('❌ Komut kaydı başarısız:', err);
  }
})();
