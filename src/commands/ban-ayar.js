const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setCfg, getCfg } = require('../utils/banData');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban-ayar')
    .setDescription('Ban bildirim sistemi kanal ayarlarını yapar')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('log')
        .setDescription('Ban bildirimlerinin atılacağı log kanalını ayarla')
        .addChannelOption(opt =>
          opt.setName('kanal').setDescription('Log kanalı').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('panel')
        .setDescription('Ban bildirim panelinin gönderileceği kanalı ayarla')
        .addChannelOption(opt =>
          opt.setName('kanal').setDescription('Panel kanalı').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('goruntule')
        .setDescription('Mevcut kanal ayarlarını göster')
    ),

  async execute(interaction) {
    const alt = interaction.options.getSubcommand();

    if (alt === 'log') {
      const kanal = interaction.options.getChannel('kanal');
      setCfg({ logKanalId: kanal.id });
      return interaction.reply({ content: `✅ Ban log kanalı <#${kanal.id}> olarak ayarlandı.`, ephemeral: true });
    }

    if (alt === 'panel') {
      const kanal = interaction.options.getChannel('kanal');
      setCfg({ panelKanalId: kanal.id });
      return interaction.reply({ content: `✅ Ban panel kanalı <#${kanal.id}> olarak ayarlandı.`, ephemeral: true });
    }

    if (alt === 'goruntule') {
      const cfg = getCfg();
      return interaction.reply({
        content:
          `**Ban Sistemi Kanal Ayarları**\n` +
          `Log Kanalı: ${cfg.logKanalId ? `<#${cfg.logKanalId}>` : '❌ Ayarlanmamış'}\n` +
          `Panel Kanalı: ${cfg.panelKanalId ? `<#${cfg.panelKanalId}>` : '❌ Ayarlanmamış'}`,
        ephemeral: true,
      });
    }
  },
};
