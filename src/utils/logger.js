const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

/**
 * Log kanalına katılma/ayrılma/bilgi mesajı gönderir.
 * @param {Client} client
 * @param {string} tip - 'katil' | 'ayril' | 'bilgi' | 'yedek' | 'yedek_cikar' | 'ac' | 'kapat'
 * @param {Object} veri - { kullanici, session, ekstra }
 */
async function log(client, tip, veri) {
  const logKanalId = process.env.LOG_CHANNEL_ID;
  if (!logKanalId) return;

  const kanal = await client.channels.fetch(logKanalId).catch(() => null);
  if (!kanal) return;

  const { kullanici, session, ekstra } = veri;

  const tipAyarlari = {
    katil:       { renk: config.renkler.log_katil,  baslik: '✅ Oyuna Katıldı',          aciklama: `<@${kullanici.id}> **${session.baslik}** oyununa katıldı.` },
    ayril:       { renk: config.renkler.log_ayril,  baslik: '❌ Oyundan Ayrıldı',         aciklama: `<@${kullanici.id}> **${session.baslik}** oyunundan ayrıldı.` },
    yedek:       { renk: '#f39c12',                 baslik: '🔸 Yedek Listesine Eklendi', aciklama: `<@${kullanici.id}> **${session.baslik}** için yedek listesine eklendi.` },
    yedek_cikar: { renk: '#e67e22',                 baslik: '🔸 Yedek Listesinden Çıktı', aciklama: `<@${kullanici.id}> **${session.baslik}** yedek listesinden ayrıldı.` },
    bilgi:       { renk: config.renkler.bilgi,      baslik: 'ℹ️ Bilgi Butonu',            aciklama: `<@${kullanici.id}> **${session.baslik}** için bilgi istedi.` },
    ac:           { renk: config.renkler.normal,     baslik: '🟢 InGame Açıldı',              aciklama: `<@${kullanici.id}> **${session.baslik}** adıyla bir ingame başlattı.\n**Limit:** ${session.limit} kişi` },
    kapat:        { renk: config.renkler.kapandi,    baslik: '🔴 InGame Kapatıldı',           aciklama: `<@${kullanici.id}> **${session.baslik}** oyununu kapattı.\n**Toplam katılımcı:** ${session.katilimcilar.length}` },
    farm_onayla:  { renk: '#2ecc71',                 baslik: '✅ Farm Teslimi Onaylandı',      aciklama: `<@${kullanici.id}> bir farm teslimini onayladı.` },
    farm_reddet:  { renk: '#e74c3c',                 baslik: '❌ Farm Teslimi Reddedildi',     aciklama: `<@${kullanici.id}> bir farm teslimini reddetti.` },
    farm_sifirla: { renk: '#e67e22',                 baslik: '🗑️ Farm Verisi Sıfırlandı',     aciklama: `<@${kullanici.id}> bir oyuncunun farm verisini sıfırladı.` },
  };

  const ayar = tipAyarlari[tip];
  if (!ayar) return;

  const embed = new EmbedBuilder()
    .setColor(ayar.renk)
    .setTitle(ayar.baslik)
    .setDescription(ayar.aciklama)
    .setThumbnail(kullanici.displayAvatarURL?.() ?? null)
    .setTimestamp()
    .setFooter({ text: `Kullanıcı ID: ${kullanici.id}` });

  if (ekstra) embed.addFields(ekstra);

  await kanal.send({ embeds: [embed] }).catch(console.error);
}

module.exports = { log };
