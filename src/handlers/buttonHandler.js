const {
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');
const { buildIngameMessage } = require('../utils/embedBuilder');
const { log } = require('../utils/logger');
const config = require('../../config.json');

/** Ephemeral Components V2 bilgi container'ı */
function buildBilgiContainer(session, user) {
  const { baslik, aciklama, limit, katilimcilar, yedekler, kapatildi } = session;

  const katilimciIdx = katilimcilar.findIndex(k => k.id === user.id);
  const yedekIdx     = yedekler.findIndex(y => y.id === user.id);

  let durumMetni;
  if (katilimciIdx !== -1) {
    durumMetni = `✅ Ana listede  **#${katilimciIdx + 1}. sıra**`;
  } else if (yedekIdx !== -1) {
    durumMetni = `🔸 Yedek listesinde  **Y${yedekIdx + 1}. sıra**`;
  } else {
    durumMetni = '❌ Hiçbir listede değilsiniz.';
  }

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ℹ️ ${baslik} — Bilgi`),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Durum**\n${kapatildi ? '🔴 Kapatıldı' : '🟢 Açık'}`,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Katılımcı**\n\`${katilimcilar.length}/${limit}\``,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Yedek**\n\`${yedekler.length}/${config.yedekSlot}\``,
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Sizin Durumunuz**\n${durumMetni}`),
    );

  if (aciklama) {
    container
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Açıklama**\n> ${aciklama}`),
      );
  }

  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [container],
  };
}

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const { customId, user, message } = interaction;
    if (!['ingame_katil', 'ingame_ayril', 'ingame_bilgi'].includes(customId)) return;

    // ingame.js'deki sessions map'ine eriş
    const ingameCmd = client.commands.get('ingame');
    if (!ingameCmd) return;
    const sessions = ingameCmd.sessions;

    const session = sessions.get(message.id);
    if (!session) {
      return interaction.reply({
        content: '❌ Bu etkinlik artık aktif değil veya bot yeniden başlatıldı.',
        ephemeral: true,
      });
    }

    // ── Kapalıysa sadece bilgi butonuna izin ver ─────────────────────────────
    if (session.kapatildi && customId !== 'ingame_bilgi') {
      return interaction.reply({
        content: '🔒 Bu etkinlik kapatıldı, artık katılamaz veya ayrılamazsınız.',
        ephemeral: true,
      });
    }

    // ────────────────────────────────────────────────────────────────────────
    // KATIL butonu
    // ────────────────────────────────────────────────────────────────────────
    if (customId === 'ingame_katil') {
      const zatenKatilimci = session.katilimcilar.find(k => k.id === user.id);
      const zatenYedek     = session.yedekler.find(y => y.id === user.id);

      if (zatenKatilimci) {
        return interaction.reply({ content: '⚠️ Zaten katılımcı listesine eklendiniz.', ephemeral: true });
      }
      if (zatenYedek) {
        return interaction.reply({ content: '⚠️ Zaten yedek listesine eklendiniz.', ephemeral: true });
      }

      const anaListeDolu   = session.katilimcilar.length >= session.limit;
      const yedekListeDolu = session.yedekler.length >= config.yedekSlot;

      if (anaListeDolu && yedekListeDolu) {
        return interaction.reply({
          content: `🔒 Hem ana liste (${session.limit} kişi) hem de yedek liste (${config.yedekSlot} kişi) doldu.`,
          ephemeral: true,
        });
      }

      const kisi = { id: user.id, tag: user.tag };

      if (!anaListeDolu) {
        session.katilimcilar.push(kisi);
        await log(client, 'katil', { kullanici: user, session });
        await interaction.reply({
          content: `✅ **${session.baslik}** oyununa katıldınız! (${session.katilimcilar.length}/${session.limit})`,
          ephemeral: true,
        });
      } else {
        session.yedekler.push(kisi);
        await log(client, 'yedek', { kullanici: user, session });
        await interaction.reply({
          content: `🔸 Ana liste doldu, **yedek** listesine eklendiniz. (Y${session.yedekler.length}/${config.yedekSlot})`,
          ephemeral: true,
        });
      }

      await message.edit(buildIngameMessage(session)).catch(console.error);
      return;
    }

    // ────────────────────────────────────────────────────────────────────────
    // AYRIL butonu
    // ────────────────────────────────────────────────────────────────────────
    if (customId === 'ingame_ayril') {
      const katilimciIdx = session.katilimcilar.findIndex(k => k.id === user.id);
      const yedekIdx     = session.yedekler.findIndex(y => y.id === user.id);

      if (katilimciIdx === -1 && yedekIdx === -1) {
        return interaction.reply({ content: '⚠️ Zaten herhangi bir listede değilsiniz.', ephemeral: true });
      }

      if (katilimciIdx !== -1) {
        session.katilimcilar.splice(katilimciIdx, 1);

        // Yedek varsa otomatik ana listeye al + DM gönder
        if (session.yedekler.length > 0) {
          const yukseltilen = session.yedekler.shift();
          session.katilimcilar.push(yukseltilen);

          const yukseltUser = await client.users.fetch(yukseltilen.id).catch(() => null);
          if (yukseltUser) {
            yukseltUser
              .send(`✅ **${session.baslik}** oyununda bir yer açıldı! Yedekten **ana listeye** alındınız.`)
              .catch(() => {});
          }
        }

        await log(client, 'ayril', { kullanici: user, session });
        await interaction.reply({
          content: `❌ **${session.baslik}** oyunundan ayrıldınız.`,
          ephemeral: true,
        });
      } else {
        session.yedekler.splice(yedekIdx, 1);
        await log(client, 'yedek_cikar', { kullanici: user, session });
        await interaction.reply({
          content: `❌ **${session.baslik}** yedek listesinden ayrıldınız.`,
          ephemeral: true,
        });
      }

      await message.edit(buildIngameMessage(session)).catch(console.error);
      return;
    }

    // ────────────────────────────────────────────────────────────────────────
    // BİLGİ butonu
    // ────────────────────────────────────────────────────────────────────────
    if (customId === 'ingame_bilgi') {
      await log(client, 'bilgi', { kullanici: user, session });
      return interaction.reply(buildBilgiContainer(session, user));
    }
  });
};
