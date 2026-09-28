const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { buildBanPanel } = require('../utils/banEmbed');
const { getCfg }        = require('../utils/banData');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban-panel')
    .setDescription('Ban bildirim panelini kalıcı olarak gönderir')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt =>
      opt.setName('gorsel')
        .setDescription('Panel görsel URL\'si (opsiyonel)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const gorselUrl = interaction.options.getString('gorsel') ?? '';
    const cfg = getCfg();

    let hedefKanal = interaction.channel;
    if (cfg.panelKanalId) {
      const bulunan = await interaction.client.channels.fetch(cfg.panelKanalId).catch(() => null);
      if (bulunan) hedefKanal = bulunan;
    }

    await interaction.reply({ content: `✅ Panel <#${hedefKanal.id}> kanalına gönderildi.`, ephemeral: true });
    await hedefKanal.send(buildBanPanel({ gorselUrl }));
  },
};
