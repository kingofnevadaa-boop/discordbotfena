const { buildFarmIstek } = require('../utils/farmEmbed');

// Bekleyen istekleri bellekte tut: islemId → { userId, userTag, miktar, not, tarih }
const bekleyenler = new Map();

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'farm_modal') return;

    const miktar = parseInt(interaction.fields.getTextInputValue('farm_miktar'), 10);
    const not    = interaction.fields.getTextInputValue('farm_not').trim();

    if (isNaN(miktar) || miktar <= 0) {
      return interaction.reply({
        content: '❌ Geçersiz miktar. Lütfen pozitif bir sayı gir.',
        ephemeral: true,
      });
    }

    const logKanalId = process.env.LOG_CHANNEL_ID;
    if (!logKanalId) {
      return interaction.reply({
        content: '❌ Log kanalı yapılandırılmamış. Yöneticiye haber ver.',
        ephemeral: true,
      });
    }

    const logKanal = await client.channels.fetch(logKanalId).catch(() => null);
    if (!logKanal) {
      return interaction.reply({
        content: '❌ Log kanalına erişilemiyor.',
        ephemeral: true,
      });
    }

    // Benzersiz işlem ID: kullanici_timestamp
    const tarih    = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    const islemId  = `${interaction.user.id}_${Date.now()}`;

    const istekVerisi = {
      islemId,
      userId:  interaction.user.id,
      userTag: interaction.user.tag,
      miktar,
      not,
      tarih,
    };

    // Bekleyenler map'e ekle — button handler okuyacak
    bekleyenler.set(islemId, istekVerisi);

    // Log kanalına gönder
    await logKanal.send(buildFarmIstek(istekVerisi));

    return interaction.reply({
      content: `✅ Teslim isteğin gönderildi!\n**Miktar:** \`${miktar}\`\nYetkili inceledikten sonra DM ile bilgilendirileceksin.`,
      ephemeral: true,
    });
  });

  // button handler'ın bekleyenler map'ine erişmesi için dışa aç
  module.exports.bekleyenler = bekleyenler;
};

module.exports.bekleyenler = bekleyenler;
