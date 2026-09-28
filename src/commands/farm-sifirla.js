const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sifirlaKullanici, getKullanici } = require('../utils/farmData');
const { log } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('farm-sifirla')
    .setDescription('Bir oyuncunun tüm farm teslim verisini sıfırlar')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(opt =>
      opt.setName('oyuncu')
        .setDescription('Verisi sıfırlanacak oyuncu')
        .setRequired(true)
    ),

  async execute(interaction) {
    const hedef = interaction.options.getUser('oyuncu');
    const veri  = getKullanici(hedef.id);

    if (!veri) {
      return interaction.reply({
        content: `❌ <@${hedef.id}> adlı oyuncuya ait kayıt bulunamadı.`,
        ephemeral: true,
      });
    }

    const eskiMiktar = veri.toplamMiktar;
    const eskiSayi   = veri.teslimler.length;

    sifirlaKullanici(hedef.id);

    await log(interaction.client, 'farm_sifirla', {
      kullanici: interaction.user,
      session:   { baslik: 'Farm Sıfırlama', katilimcilar: [] },
      ekstra: [
        { name: 'Hedef Oyuncu', value: `<@${hedef.id}> \`${hedef.tag}\``, inline: true },
        { name: 'Silinen Miktar', value: `\`${eskiMiktar}\``,             inline: true },
        { name: 'Silinen İşlem', value: `\`${eskiSayi}\` adet`,           inline: true },
      ],
    });

    return interaction.reply({
      content: `✅ <@${hedef.id}> adlı oyuncunun verileri sıfırlandı.\n**Silinen:** \`${eskiMiktar}\` toplam miktar, \`${eskiSayi}\` teslim kaydı.`,
      ephemeral: true,
    });
  },
};
