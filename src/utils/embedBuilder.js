const {
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const config = require('../../config.json');

/**
 * Components V2 ingame container + buton satırını oluşturur.
 * @param {Object} session
 * @returns {{ components: ContainerBuilder[], flags: number }}
 */
function buildIngameMessage(session) {
  const { baslik, aciklama, limit, katilimcilar, yedekler, kapatildi } = session;
  const dolu = katilimcilar.length >= limit;

  // ── Durum satırı (görseldeki diff bloğu) ────────────────────────────────
  let durumSatiri;
  if (kapatildi) {
    durumSatiri = '```diff\n- [ KAPANDI ] -\n```';
  } else if (dolu) {
    durumSatiri = `\`\`\`diff\n+ [ HEDEFE ULAŞILDI (${katilimcilar.length}/${limit}) ] +\n\`\`\``;
  } else {
    durumSatiri = `\`\`\`diff\n+ [ AKTİF (${katilimcilar.length}/${limit}) ] +\n\`\`\``;
  }

  // ── Süre satırı ──────────────────────────────────────────────────────────
  const sureSatiri = `**sure:** ${kapatildi ? 'Süre Doldu / Bitti' : 'Devam Ediyor'}`;

  // ── Katılımcı listesi ────────────────────────────────────────────────────
  let katilimciMetni;
  if (katilimcilar.length === 0) {
    katilimciMetni = '*Henüz kimse katılmadı.*';
  } else {
    katilimciMetni = katilimcilar
      .map((k, i) => `${i + 1}. <@${k.id}> \`${k.id}\``)
      .join('\n');
  }

  // ── Yedek listesi ────────────────────────────────────────────────────────
  let yedekMetni = '';
  if (yedekler.length > 0) {
    yedekMetni =
      '\n\n**~ YEDEKLER ~**\n' +
      yedekler
        .map((y, i) => `Y${i + 1}. <@${y.id}> \`${y.id}\``)
        .join('\n');
  }

  // ── Container ────────────────────────────────────────────────────────────
  const container = new ContainerBuilder()

    // Başlık
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${baslik}`),
    )

    // Durum bloğu (diff rengi) + süre
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${durumSatiri}\n${sureSatiri}`),
    );

  // Açıklama varsa ek alan
  if (aciklama) {
    container
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`> ${aciklama}`),
      );
  }

  // Katılımcı bölümü
  container
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Katılımcılar**\n\n${katilimciMetni}${yedekMetni}`,
      ),
    )

    // Footer bilgisi
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# Maksimum: ${limit} kişi  •  Yedek: ${config.yedekSlot} slot`,
      ),
    );

  // ── Butonlar ─────────────────────────────────────────────────────────────
  const katilBtn = new ButtonBuilder()
    .setCustomId('ingame_katil')
    .setStyle(dolu || kapatildi ? ButtonStyle.Secondary : ButtonStyle.Success)
    .setDisabled(kapatildi);

  if (dolu && !kapatildi) {
    katilBtn.setEmoji('🟡').setLabel('Dolu - Yedek Ol');
  } else {
    katilBtn.setLabel('Katıl');
  }

  const ayrilBtn = new ButtonBuilder()
    .setCustomId('ingame_ayril')
    .setLabel('Ayrıl')
    .setStyle(ButtonStyle.Danger)
    .setDisabled(kapatildi);

  const bilgiBtn = new ButtonBuilder()
    .setCustomId('ingame_bilgi')
    .setLabel('Bilgi')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(katilBtn, ayrilBtn, bilgiBtn);

  // Buton satırı container'ın içine gömülüyor (Components V2 zorunluluğu)
  container.addActionRowComponents(row);

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

module.exports = { buildIngameMessage };
