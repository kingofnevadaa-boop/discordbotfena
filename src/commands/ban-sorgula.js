const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { banAra }         = require('../utils/banData');
const { buildBanSorgula, buildBanListe } = require('../utils/banEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban-sorgula')
    .setDescription('Hesap adı veya ID ile banlı hesap sorgular')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt =>
      opt.setName('sorgu')
        .setDescription('Hesap adı veya ID')
        .setRequired(true)
        .setMaxLength(50)
    ),

  async execute(interaction) {
    const sorgu    = interaction.options.getString('sorgu').trim();
    const sonuclar = banAra(sorgu);

    if (sonuclar.length === 0) {
      return interaction.reply({
        content: `❌ \`${sorgu}\` için kayıt bulunamadı.`,
        ephemeral: true,
      });
    }

    // Tek sonuç → detaylı kart, birden fazla → liste
    if (sonuclar.length === 1) {
      return interaction.reply(buildBanSorgula(sonuclar[0]));
    }

    return interaction.reply(buildBanListe(sonuclar));
  },
};
