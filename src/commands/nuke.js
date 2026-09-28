const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Kanaldaki mesajları siler')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt =>
      opt.setName('adet')
        .setDescription('Silinecek mesaj sayısı (1-100). Belirtilmezse kanal tamamen sıfırlanır.')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addChannelOption(opt =>
      opt.setName('kanal')
        .setDescription('Hedef kanal (belirtilmezse komutu kullandığın kanal)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const adet      = interaction.options.getInteger('adet');
    const hedefKanal = interaction.options.getChannel('kanal') ?? interaction.channel;

    await interaction.deferReply({ ephemeral: true });

    // ── Belirli sayıda mesaj sil (bulkDelete, max 100, 14 günden eski silinmez) ──
    if (adet) {
      const silinenler = await hedefKanal.bulkDelete(adet, true).catch(() => null);
      const sayi = silinenler?.size ?? 0;
      return interaction.editReply({
        content: `✅ <#${hedefKanal.id}> kanalından **${sayi}** mesaj silindi.${sayi < adet ? `\n-# Not: ${adet - sayi} mesaj 14 günden eski olduğu için silinemedi.` : ''}`,
      });
    }

    // ── Tam nuke: kanalı klonla, eskisini sil ────────────────────────────────
    // bulkDelete 100'den fazlasını desteklemediği ve 14 gün sınırı olduğu için
    // en güvenilir tam temizleme yöntemi kanalı klonlamaktır.
    try {
      const yeniKanal = await hedefKanal.clone({
        reason: `Nuke — ${interaction.user.tag}`,
      });

      // Pozisyonu koru
      await yeniKanal.setPosition(hedefKanal.position).catch(() => {});
      await hedefKanal.delete(`Nuke — ${interaction.user.tag}`);

      await yeniKanal.send({
        content: `☢️ Kanal **${interaction.user.tag}** tarafından nuke edildi.`,
      });

      return interaction.editReply({
        content: `✅ <#${yeniKanal.id}> kanalı nuke edildi.`,
      });
    } catch (err) {
      console.error(err);
      return interaction.editReply({
        content: '❌ Nuke sırasında bir hata oluştu. Bot\'un kanal yönetme yetkisi var mı?',
      });
    }
  },
};
