const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { buildIngameMessage } = require('../utils/embedBuilder');
const { log } = require('../utils/logger');

// Aktif ingame oturumlarını bellekte tutar.
// Key: mesaj ID  →  Value: session objesi
const sessions = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ingame')
    .setDescription('InGame etkinliği yönetim komutları')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    // ── /ingame ac ──────────────────────────────────────────────────────────
    .addSubcommand(sub =>
      sub.setName('ac')
        .setDescription('Yeni bir ingame etkinliği başlat')
        .addStringOption(opt =>
          opt.setName('baslik')
            .setDescription('Etkinlik başlığı (örn: RZ 22:00)')
            .setRequired(true)
        )
        .addIntegerOption(opt =>
          opt.setName('limit')
            .setDescription('Maksimum katılımcı sayısı')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        )
        .addStringOption(opt =>
          opt.setName('aciklama')
            .setDescription('Etkinlik açıklaması (opsiyonel)')
            .setRequired(false)
        )
    )
    // ── /ingame kapat ────────────────────────────────────────────────────────
    .addSubcommand(sub =>
      sub.setName('kapat')
        .setDescription('Aktif ingame etkinliğini kapat')
        .addStringOption(opt =>
          opt.setName('mesaj_id')
            .setDescription('Kapatılacak ingame mesajının ID\'si')
            .setRequired(true)
        )
    ),

  // Oturumları başka modüllerin (button handler) erişebilmesi için dışa aç
  sessions,

  async execute(interaction) {
    const alt = interaction.options.getSubcommand();

    // ────────────────────────────────────────────────────────────────────────
    // /ingame ac
    // ────────────────────────────────────────────────────────────────────────
    if (alt === 'ac') {
      const baslik   = interaction.options.getString('baslik');
      const limit    = interaction.options.getInteger('limit');
      const aciklama = interaction.options.getString('aciklama') ?? '';

      const session = {
        baslik,
        aciklama,
        limit,
        katilimcilar: [],   // [{ id, tag }]
        yedekler:     [],   // [{ id, tag }]
        kapatildi:    false,
        olusturanId:  interaction.user.id,
      };

      const payload = buildIngameMessage(session);

      const mesaj = await interaction.reply({
        ...payload,
        fetchReply: true,
      });

      session.mesajId = mesaj.id;
      session.kanalId = mesaj.channelId;
      sessions.set(mesaj.id, session);

      await log(interaction.client, 'ac', { kullanici: interaction.user, session });
      return;
    }

    // ────────────────────────────────────────────────────────────────────────
    // /ingame kapat
    // ────────────────────────────────────────────────────────────────────────
    if (alt === 'kapat') {
      const mesajId = interaction.options.getString('mesaj_id');
      const session = sessions.get(mesajId);

      if (!session) {
        return interaction.reply({
          content: '❌ Bu ID\'ye ait aktif bir ingame bulunamadı.',
          ephemeral: true,
        });
      }

      session.kapatildi = true;
      const payload = buildIngameMessage(session);

      const kanal = await interaction.client.channels.fetch(session.kanalId).catch(() => null);
      if (kanal) {
        const mesaj = await kanal.messages.fetch(mesajId).catch(() => null);
        if (mesaj) await mesaj.edit(payload);
      }

      await log(interaction.client, 'kapat', { kullanici: interaction.user, session });

      return interaction.reply({
        content: `✅ **${session.baslik}** ingame etkinliği kapatıldı.`,
        ephemeral: true,
      });
    }
  },
};
