const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'farms.json');

/** Tüm veriyi oku */
function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return {};
  }
}

/** Tüm veriyi yaz */
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Onaylanan teslimi kullanıcıya kaydet.
 * @param {string} userId
 * @param {Object} kayit - { miktar, not, onaylayanId, onaylayanTag, tarih, islemId }
 */
function kaydetTeslim(userId, kayit) {
  const db = readDB();
  if (!db[userId]) db[userId] = { toplamMiktar: 0, teslimler: [] };

  db[userId].toplamMiktar += kayit.miktar;
  db[userId].teslimler.push(kayit);
  writeDB(db);
}

/**
 * Kullanıcının tüm teslim kaydını getir.
 * @param {string} userId
 * @returns {{ toplamMiktar: number, teslimler: Array } | null}
 */
function getKullanici(userId) {
  const db = readDB();
  return db[userId] ?? null;
}

/**
 * Kullanıcının verisini sıfırla.
 * @param {string} userId
 */
function sifirlaKullanici(userId) {
  const db = readDB();
  delete db[userId];
  writeDB(db);
}

/**
 * Sunucudaki tüm kullanıcıların özetini döndür (sıralama için).
 * @returns {Array<{ userId, toplamMiktar, teslimSayisi }>}
 */
function tumKullanicilar() {
  const db = readDB();
  return Object.entries(db).map(([userId, veri]) => ({
    userId,
    toplamMiktar: veri.toplamMiktar,
    teslimSayisi: veri.teslimler.length,
  }));
}

module.exports = { kaydetTeslim, getKullanici, sifirlaKullanici, tumKullanicilar };
