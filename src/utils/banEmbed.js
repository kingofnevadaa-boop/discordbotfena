const {
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} = require('discord.js');

// ─────────────────────────────────────────────────────────────────────────────
// KALICI PANEL
// ─────────────────────────────────────────────────────────────────────────────
function buildBanPanel({ gorselUrl } = {}) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('#  Ban Bildirim Sistemi'),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        'Ekibimizde banlı olan kişiler için banları daha düzenli tutmak için banları artık buradan gönderiyoruz.',
      ),
    );

  if (gorselUrl) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(gorselUrl),
      ),
    );
  }

  container
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ban_bildir')
          .setLabel('🔨 Ban Bildir')
          .setStyle(ButtonStyle.Secondary),
      ),
    );

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

// ─────────────────────────────────────────────────────────────────────────────
// LOG — YENİ BAN BİLDİRİMİ
// ─────────────────────────────────────────────────────────────────────────────
function buildBanLog({ kayitId, bildirenId, bildirenTag, hesapAdi, hesapId, banSebebi, tarih }) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# 🔨 Yeni Ban Bildirimi'),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Bildiren**\n<@${bildirenId}> \`${bildirenTag}\``),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Banlanan Hesap Adı**\n\`${hesapAdi}\``),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Banlanan Hesap ID**\n\`${hesapId}\``),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Ban Sebebi**\n${banSebebi || '*Belirtilmedi*'}`),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Kayıt ID: \`${kayitId}\`  •  ${tarih}`),
    );

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

// ─────────────────────────────────────────────────────────────────────────────
// LİSTE — ephemeral
// ─────────────────────────────────────────────────────────────────────────────
function buildBanListe(kayitlar) {
  let icerik;
  if (kayitlar.length === 0) {
    icerik = '*Henüz kayıt bulunmuyor.*';
  } else {
    icerik = kayitlar.slice(0, 15).map((k, i) =>
      `**${i + 1}.** \`${k.hesapAdi}\` — ID: \`${k.hesapId}\`\n` +
      `↳ Bildiren: <@${k.bildirenId}>  •  ${k.tarih}\n` +
      `↳ Sebep: ${k.banSebebi || '*Belirtilmedi*'}`
    ).join('\n\n');

    if (kayitlar.length > 15) {
      icerik += `\n\n-# ... ve ${kayitlar.length - 15} kayıt daha`;
    }
  }

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# 📋 Banlı Hesap Listesi'),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Toplam Kayıt:** \`${kayitlar.length}\`\n\n${icerik}`),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('-# En yeni 15 kayıt gösteriliyor'),
    );

  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [container],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SORGULA — tek hesap (ephemeral)
// ─────────────────────────────────────────────────────────────────────────────
function buildBanSorgula(kayit) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# 🔍 Ban Sorgu Sonucu'),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Hesap Adı**\n\`${kayit.hesapAdi}\``),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Hesap ID**\n\`${kayit.hesapId}\``),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Ban Sebebi**\n${kayit.banSebebi || '*Belirtilmedi*'}`),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Bildiren**\n<@${kayit.bildirenId}> \`${kayit.bildirenTag}\``,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Kayıt ID: \`${kayit.kayitId}\`  •  ${kayit.tarih}`),
    );

  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [container],
  };
}

module.exports = { buildBanPanel, buildBanLog, buildBanListe, buildBanSorgula };

// ─────────────────────────────────────────────────────────────────────────────
// LOG — KAYIT SİLİNDİ
// ─────────────────────────────────────────────────────────────────────────────
function buildBanSilLog({ silenId, silenTag, kayitlar }) {
  // kayitlar: [{ kayitId, hesapAdi, hesapId }]
  const liste = kayitlar.map(k =>
    `\`${k.kayitId}\` — \`${k.hesapAdi}\` (ID: \`${k.hesapId}\`)`
  ).join('\n');

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# 🗑️ Ban Kaydı Silindi'),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Silen Yetkili**\n<@${silenId}> \`${silenTag}\``),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Silinen Kayıt${kayitlar.length > 1 ? 'lar' : ''}**\n${liste}`),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}`,
      ),
    );

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

module.exports = { buildBanPanel, buildBanLog, buildBanListe, buildBanSorgula, buildBanSilLog };
