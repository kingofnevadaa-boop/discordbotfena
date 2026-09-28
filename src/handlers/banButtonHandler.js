const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'ban_bildir') return;

    const modal = new ModalBuilder()
      .setCustomId('ban_modal')
      .setTitle('🔨 Ban Bildirimi');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('ban_hesap_adi')
          .setLabel('Banlanan Hesap Adı')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('örn: Ahmet#1234')
          .setRequired(true)
          .setMaxLength(100),
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('ban_hesap_id')
          .setLabel('Banlanan Hesap ID (sadece rakam)')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('örn: 123456789012345678')
          .setRequired(true)
          .setMaxLength(20),
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('ban_sebep')
          .setLabel('Ban Sebebi (opsiyonel)')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Neden banlandığını kısaca açıkla...')
          .setRequired(false)
          .setMaxLength(300),
      ),
    );

    return interaction.showModal(modal);
  });
};
