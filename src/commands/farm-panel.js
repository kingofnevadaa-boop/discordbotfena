const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { buildFarmPanel } = require('../utils/farmEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm-panel')
    .setDescription('Farm teslim panelini kalıcı olarak gönderir')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    // Komutu ephemeral sil, paneli kanala kalıcı gönder
    await interaction.reply({ content: '✅ Panel gönderildi.', ephemeral: true });
    await interaction.channel.send(buildFarmPanel());
  },
};
