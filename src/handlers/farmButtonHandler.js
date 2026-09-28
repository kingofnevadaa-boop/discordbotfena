const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { buildFarmOnaylandi, buildFarmReddedildi } = require('../utils/farmEmbed');
const { kaydetTeslim } = require('../utils/farmData');
const { log } = require('../utils/logger');

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    const { customId, user } = interaction;

    // ── Panel butonu: Modal aç ───────────────────────────────────────────────
    if (customId === 'farm_teslim') {
      const modal = new ModalBuilder()
        .setCustomId('farm_modal')
        .setTitle('🌾 Farm Teslim İsteği');

      const miktarInput = new TextInputBuilder()
        .setCustomId('farm_miktar')
        .setLabel('Miktar (sadece sayı)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('örn: 250')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(10);

      const notInput = new TextInputBuilder()
        .setCustomId('farm_not')
        .setLabel('Not (opsiyonel)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Eklemek istediğin bir şey varsa yaz...')
        .setRequired(false)
        .setMaxLength(200);

      modal.addComponents(
        new ActionRowBuilder().addComponents(miktarInput),
        new ActionRowBuilder().addComponents(notInput),
      );

      return interaction.showModal(modal);
    }

    // ── Onayla butonu ────────────────────────────────────────────────────────
    if (customId.startsWith('farm_onayla_')) {
      // Yetki kontrolü
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({
          content: '❌ Bu işlemi yapmaya yetkin yok.',
          ephemeral: true,
        });
      }

      const islemId = customId.replace('farm_onayla_', '');

      // farmModalHandler'ın bekleyenler map'ine eriş
      const bekleyenler = require('./farmModalHandler').bekleyenler;
      const istekVerisi  = bekleyenler.get(islemId);

      if (!istekVerisi) {
        return interaction.reply({
          content: '❌ Bu istek artık geçerli değil (zaten işleme alındı veya bot yeniden başladı).',
          ephemeral: true,
        });
      }

      // Dataya kaydet
      kaydetTeslim(istekVerisi.userId, {
        ...istekVerisi,
        onaylayanId:  user.id,
        onaylayanTag: user.tag,
      });

      bekleyenler.delete(islemId);

      // Log mesajını güncelle (butonları kaldır, onaylandı göster)
      const onayPayload = buildFarmOnaylandi({
        ...istekVerisi,
        onaylayanId:  user.id,
        onaylayanTag: user.tag,
      });
      await interaction.message.edit(onayPayload).catch(console.error);

      // Kullanıcıya DM
      const hedefUser = await client.users.fetch(istekVerisi.userId).catch(() => null);
      if (hedefUser) {
        hedefUser
          .send(`✅ **Farm teslim isteğin onaylandı!**\n**Miktar:** \`${istekVerisi.miktar}\`\n**Onaylayan:** ${user.tag}`)
          .catch(() => {});
      }

      await log(client, 'farm_onayla', {
        kullanici: user,
        session:   { baslik: 'Farm Onay', katilimcilar: [] },
        ekstra: [
          { name: 'Oyuncu',  value: `<@${istekVerisi.userId}>`,  inline: true },
          { name: 'Miktar',  value: `\`${istekVerisi.miktar}\``, inline: true },
          { name: 'İşlem',   value: `\`${islemId}\``,            inline: false },
        ],
      });

      return interaction.reply({
        content: `✅ <@${istekVerisi.userId}> adlı oyuncunun teslimi onaylandı ve kayıt edildi.`,
        ephemeral: true,
      });
    }

    // ── Reddet butonu ────────────────────────────────────────────────────────
    if (customId.startsWith('farm_reddet_')) {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({
          content: '❌ Bu işlemi yapmaya yetkin yok.',
          ephemeral: true,
        });
      }

      const islemId = customId.replace('farm_reddet_', '');

      // Red sebebi için modal aç
      const redModal = new ModalBuilder()
        .setCustomId(`farm_red_modal_${islemId}`)
        .setTitle('❌ Red Sebebi');

      redModal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('red_sebep')
            .setLabel('Red sebebi (opsiyonel)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Neden reddediyorsun?')
            .setRequired(false)
            .setMaxLength(300),
        ),
      );

      return interaction.showModal(redModal);
    }
  });

  // ── Red Modal Submit ─────────────────────────────────────────────────────
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (!interaction.customId.startsWith('farm_red_modal_')) return;

    const islemId    = interaction.customId.replace('farm_red_modal_', '');
    const redNot     = interaction.fields.getTextInputValue('red_sebep').trim();
    const bekleyenler = require('./farmModalHandler').bekleyenler;
    const istekVerisi  = bekleyenler.get(islemId);

    if (!istekVerisi) {
      return interaction.reply({
        content: '❌ Bu istek artık geçerli değil.',
        ephemeral: true,
      });
    }

    bekleyenler.delete(islemId);

    // Log mesajını güncelle
    const redPayload = buildFarmReddedildi({
      ...istekVerisi,
      reddedenfId:  interaction.user.id,
      reddedenTag:  interaction.user.tag,
      redNot,
    });

    // Red modalı yeni bir interaction — orijinal log mesajını bulmak için
    // interaction.message yok, channel'dan fetch etmemiz gerekiyor
    const logKanal = await client.channels.fetch(process.env.LOG_CHANNEL_ID).catch(() => null);
    if (logKanal) {
      // Son mesajları tara, islemId eşleşeni bul ve güncelle
      const mesajlar = await logKanal.messages.fetch({ limit: 20 }).catch(() => null);
      if (mesajlar) {
        const hedefMesaj = mesajlar.find(m =>
          m.components?.length > 0 &&
          m.components[0]?.components?.some(c => c.customId === `farm_reddet_${islemId}`)
        );
        if (hedefMesaj) await hedefMesaj.edit(redPayload).catch(console.error);
      }
    }

    // Kullanıcıya DM
    const hedefUser = await client.users.fetch(istekVerisi.userId).catch(() => null);
    if (hedefUser) {
      hedefUser
        .send(`❌ **Farm teslim isteğin reddedildi.**\n**Miktar:** \`${istekVerisi.miktar}\`\n**Reddeden:** ${interaction.user.tag}${redNot ? `\n**Sebep:** ${redNot}` : ''}`)
        .catch(() => {});
    }

    await log(client, 'farm_reddet', {
      kullanici: interaction.user,
      session:   { baslik: 'Farm Red', katilimcilar: [] },
      ekstra: [
        { name: 'Oyuncu',   value: `<@${istekVerisi.userId}>`,  inline: true },
        { name: 'Miktar',   value: `\`${istekVerisi.miktar}\``, inline: true },
        { name: 'Sebep',    value: redNot || '*Belirtilmedi*',   inline: false },
      ],
    });

    return interaction.reply({
      content: `❌ <@${istekVerisi.userId}> adlı oyuncunun teslimi reddedildi.`,
      ephemeral: true,
    });
  });
};
