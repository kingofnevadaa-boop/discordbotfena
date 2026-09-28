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

// ─────────────────────────────────────────────────────────────────────────────
// KALICI PANEL
// ─────────────────────────────────────────────────────────────────────────────
function buildFarmPanel() {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# 🌾 Farm Teslim Sistemi'),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        '> Farmladığın miktarı teslim etmek için aşağıdaki butona bas.\n> Yetkili inceleyip onaylayacak veya reddedecek.',
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        '-# Onaylanan teslimler kalıcı olarak kayıt altına alınır.',
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('farm_teslim')
          .setLabel('🌾 Teslim Et')
          .setStyle(ButtonStyle.Success),
      ),
    );

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

// ─────────────────────────────────────────────────────────────────────────────
// LOG KANALI — YENİ İSTEK
// ─────────────────────────────────────────────────────────────────────────────
function buildFarmIstek({ islemId, userId, userTag, miktar, not, tarih }) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# 🌾 Yeni Farm Teslim İsteği'),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Oyuncu**\n<@${userId}> \`${userTag}\``,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Miktar**\n\`${miktar}\``,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Not**\n${not || '*Belirtilmedi*'}`,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# İşlem ID: \`${islemId}\`  •  ${tarih}`,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`farm_onayla_${islemId}`)
          .setLabel('✅ Onayla')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`farm_reddet_${islemId}`)
          .setLabel('❌ Reddet')
          .setStyle(ButtonStyle.Danger),
      ),
    );

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

// ─────────────────────────────────────────────────────────────────────────────
// LOG — ONAYLANDI
// ─────────────────────────────────────────────────────────────────────────────
function buildFarmOnaylandi({ islemId, userId, userTag, miktar, not, tarih, onaylayanId, onaylayanTag }) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# ✅ Farm Teslimi Onaylandı'),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Oyuncu**\n<@${userId}> \`${userTag}\``,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Miktar**\n\`${miktar}\``),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Not**\n${not || '*Belirtilmedi*'}`),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Onaylayan**\n<@${onaylayanId}> \`${onaylayanTag}\``,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# İşlem ID: \`${islemId}\`  •  ${tarih}`,
      ),
    );

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

// ─────────────────────────────────────────────────────────────────────────────
// LOG — REDDEDİLDİ
// ─────────────────────────────────────────────────────────────────────────────
function buildFarmReddedildi({ islemId, userId, userTag, miktar, not, tarih, reddedenfId, reddedenTag, redNot }) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# ❌ Farm Teslimi Reddedildi'),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Oyuncu**\n<@${userId}> \`${userTag}\``,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Miktar**\n\`${miktar}\``),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Not**\n${not || '*Belirtilmedi*'}`),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Reddeden**\n<@${reddedenfId}> \`${reddedenTag}\``,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Red Sebebi**\n${redNot || '*Belirtilmedi*'}`,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# İşlem ID: \`${islemId}\`  •  ${tarih}`,
      ),
    );

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

// ─────────────────────────────────────────────────────────────────────────────
// SORGULAMA — kullanıcı geçmişi (ephemeral)
// ─────────────────────────────────────────────────────────────────────────────
function buildFarmSorgula({ userId, userTag, veri }) {
  const son5 = [...veri.teslimler].reverse().slice(0, 5);

  const gecmisMetni = son5.length === 0
    ? '*Kayıt bulunamadı.*'
    : son5.map((t, i) =>
        `**${i + 1}.** \`${t.miktar}\` miktar — ${t.tarih}\n` +
        `↳ Onaylayan: <@${t.onaylayanId}>${t.not ? `\n↳ Not: ${t.not}` : ''}`
      ).join('\n\n');

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 📋 Farm Geçmişi — <@${userId}>`),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Toplam Teslim Miktarı**\n\`${veri.toplamMiktar}\`\n\n**Toplam İşlem Sayısı**\n\`${veri.teslimler.length}\``,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Son 5 Teslim**\n\n${gecmisMetni}`,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Kullanıcı: \`${userTag}\``),
    );

  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [container],
  };
}

module.exports = {
  buildFarmPanel,
  buildFarmIstek,
  buildFarmOnaylandi,
  buildFarmReddedildi,
  buildFarmSorgula,
};
