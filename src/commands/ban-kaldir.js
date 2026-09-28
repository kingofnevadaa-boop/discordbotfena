const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { banSil, banGetir, banListeleBildiren, getCfg } = require('../utils/banData');
const { buildBanSilLog } = require('../utils/banEmbed');

async function logAt(client, payload) {
  const cfg = getCfg();
  if (!cfg.logKanalId) return;
  const kanal = await client.channels.fetch(cfg.logKanalId).catch(() => null);
  if (kanal) await kanal.send(payload).catch(console.error);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban-kaldir')
    .setDescription('Kayıttan banlı hesabı kaldırır')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt =>
      opt.setName('kayit_id')
        .setDescription('Silinecek kaydın ID\'si (/ban-sorgula veya /ban-liste ile öğren)')
        .setRequired(false)
    )
    .addUserOption(opt =>
      opt.setName('bildiren')
        .setDescription('Bu kişinin bildirdiği tüm kayıtları sil')
        .setRequired(false)
    ),

  async execute(interaction) {
    const kayitId  = interaction.options.getString('kayit_id');
    const bildiren = interaction.options.getUser('bildiren');

    if (!kayitId && !bildiren) {
      return interaction.reply({
        content: '❌ `kayit_id` veya `bildiren` parametrelerinden birini girmelisin.',
        ephemeral: true,
      });
    }

    // ── Tek kayıt sil ────────────────────────────────────────────────────────
    if (kayitId) {
      const kayit = banGetir(kayitId);
      if (!kayit) {
        return interaction.reply({
          content: `❌ \`${kayitId}\` ID'li kayıt bulunamadı.`,
          ephemeral: true,
        });
      }

      banSil(kayitId);

      await logAt(interaction.client, buildBanSilLog({
        silenId:  interaction.user.id,
        silenTag: interaction.user.tag,
        kayitlar: [{ kayitId: kayit.kayitId, hesapAdi: kayit.hesapAdi, hesapId: kayit.hesapId }],
      }));

      return interaction.reply({
        content: `✅ \`${kayitId}\` ID'li kayıt silindi.`,
        ephemeral: true,
      });
    }

    // ── Bir kullanıcının tüm kayıtlarını sil ─────────────────────────────────
    if (bildiren) {
      const liste = banListeleBildiren(bildiren.id);
      if (liste.length === 0) {
        return interaction.reply({
          content: `❌ <@${bildiren.id}> adlı kullanıcının bildirdiği kayıt bulunamadı.`,
          ephemeral: true,
        });
      }

      liste.forEach(k => banSil(k.kayitId));

      await logAt(interaction.client, buildBanSilLog({
        silenId:  interaction.user.id,
        silenTag: interaction.user.tag,
        kayitlar: liste.map(k => ({ kayitId: k.kayitId, hesapAdi: k.hesapAdi, hesapId: k.hesapId })),
      }));

      return interaction.reply({
        content: `✅ <@${bildiren.id}> adlı kullanıcının **${liste.length}** kaydı silindi.`,
        ephemeral: true,
      });
    }
  },
};
