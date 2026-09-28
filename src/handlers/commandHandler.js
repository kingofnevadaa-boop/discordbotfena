module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`[HATA] /${interaction.commandName}:`, err);
      const yanit = { content: '❌ Komut çalıştırılırken bir hata oluştu.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(yanit).catch(() => {});
      } else {
        await interaction.reply(yanit).catch(() => {});
      }
    }
  });
};
