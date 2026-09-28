const { banEkle, getCfg } = require('../utils/banData');
const { buildBanLog }    = require('../utils/banEmbed');

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'ban_modal') return;

    const hesapAdi  = interaction.fields.getTextInputValue('ban_hesap_adi').trim();
    const hesapId   = interaction.fields.getTextInputValue('ban_hesap_id').trim();
    const banSebebi = interaction.fields.getTextInputValue('ban_sebep').trim();

    if (!/^\d+$/.test(hesapId)) {
      return interaction.reply({
        content: '❌ Hesap ID yalnızca rakamlardan oluşmalıdır.',
        ephemeral: true,
      });
    }

    const cfg = getCfg();
    if (!cfg.logKanalId) {
      return interaction.reply({
        content: '❌ Ban log kanalı ayarlanmamış. Yöneticiye haber ver. (`/ban-ayar log`)',
        ephemeral: true,
      });
    }

    const logKanal = await client.channels.fetch(cfg.logKanalId).catch(() => null);
    if (!logKanal) {
      return interaction.reply({ content: '❌ Log kanalına erişilemiyor.', ephemeral: true });
    }

    const tarihMs = Date.now();
    const tarih   = new Date(tarihMs).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    const kayitId = 'BAN-' + Math.random().toString(36).toUpperCase().slice(2, 8);

    const kayit = {
      kayitId,
      bildirenId:  interaction.user.id,
      bildirenTag: interaction.user.tag,
      hesapAdi,
      hesapId,
      banSebebi,
      tarih,
      tarihMs,
    };

    // Onay gerekmez — direkt kaydet ve log at
    banEkle(kayit);
    await logKanal.send(buildBanLog(kayit));

    return interaction.reply({
      content:
        `✅ Ban bildirimi kaydedildi!\n` +
        `**Hesap:** \`${hesapAdi}\`\n` +
        `**ID:** \`${hesapId}\``,
      ephemeral: true,
    });
  });
};
