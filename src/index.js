require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs   = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// ── Komutları yükle ──────────────────────────────────────────────────────────
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const cmd = require(path.join(commandsPath, file));
  if (cmd.data && cmd.execute) {
    client.commands.set(cmd.data.name, cmd);
    console.log(`[KOMUT] /${cmd.data.name} yüklendi`);
  }
}

// ── Handler'ları yükle ───────────────────────────────────────────────────────
const handlersPath = path.join(__dirname, 'handlers');
for (const file of fs.readdirSync(handlersPath).filter(f => f.endsWith('.js'))) {
  require(path.join(handlersPath, file))(client);
  console.log(`[HANDLER] ${file} yüklendi`);
}

// ── Hazır ────────────────────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`\n✅ Bot çevrimiçi: ${client.user.tag}`);
  console.log(`📡 Sunucu sayısı: ${client.guilds.cache.size}`);
  client.user.setActivity('.gg/ralles', { type: 3 });
});

client.login(process.env.TOKEN);
