const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { banListele, banListeleBildiren } = require('../utils/banData');
const { buildBanListe }                  = require('../utils/banEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban-liste')
    .setDescription('Banlı hesapları listeler')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(opt =>
      opt.setName('bildiren')
        .setDescription('Sadece belirli bir kişinin bildirdiği kayıtları göster')
        .setRequired(false)
    ),

  async execute(interaction) {
    const bildiren = interaction.options.getUser('bildiren');

    const kayitlar = bildiren
      ? banListeleBildiren(bildiren.id)
      : banListele();

    return interaction.reply(buildBanListe(kayitlar));
  },
};
