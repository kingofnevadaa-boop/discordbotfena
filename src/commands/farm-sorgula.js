const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getKullanici } = require('../utils/farmData');
const { buildFarmSorgula } = require('../utils/farmEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm-sorgula')
    .setDescription('Bir oyuncunun farm teslim geçmişini gösterir')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(opt =>
      opt.setName('oyuncu')
        .setDescription('Sorgulanacak oyuncu')
        .setRequired(true)
    ),

  async execute(interaction) {
    const hedef = interaction.options.getUser('oyuncu');
    const veri  = getKullanici(hedef.id);

    if (!veri || veri.teslimler.length === 0) {
      return interaction.reply({
        content: `❌ <@${hedef.id}> adlı oyuncuya ait kayıt bulunamadı.`,
        ephemeral: true,
      });
    }

    return interaction.reply(
      buildFarmSorgula({ userId: hedef.id, userTag: hedef.tag, veri }),
    );
  },
};
