const fs   = require('fs');
const path = require('path');

const BANS_PATH = path.join(__dirname, '..', '..', 'data', 'bans.json');
const CFG_PATH  = path.join(__dirname, '..', '..', 'data', 'ban-config.json');

// ─── Yardımcı ────────────────────────────────────────────────────────────────
function readBans() {
  try { return JSON.parse(fs.readFileSync(BANS_PATH, 'utf8')); } catch { return {}; }
}
function writeBans(data) {
  fs.writeFileSync(BANS_PATH, JSON.stringify(data, null, 2), 'utf8');
}
function readCfg() {
  try { return JSON.parse(fs.readFileSync(CFG_PATH, 'utf8')); } catch { return {}; }
}
function writeCfg(data) {
  fs.writeFileSync(CFG_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// ─── Config ──────────────────────────────────────────────────────────────────
function getCfg() { return readCfg(); }
function setCfg(partial) { writeCfg({ ...readCfg(), ...partial }); }

// ─── Ban CRUD ─────────────────────────────────────────────────────────────────
function banEkle(kayit) {
  const db = readBans();
  db[kayit.kayitId] = kayit;
  writeBans(db);
}

function banSil(kayitId) {
  const db = readBans();
  const vardi = !!db[kayitId];
  delete db[kayitId];
  writeBans(db);
  return vardi;
}

function banGetir(kayitId) {
  return readBans()[kayitId] ?? null;
}

/** Hesap adı veya ID ile arama */
function banAra(sorgu) {
  const db    = readBans();
  const kucuk = sorgu.toLowerCase();
  return Object.values(db).filter(k =>
    k.hesapAdi.toLowerCase().includes(kucuk) ||
    k.hesapId.includes(sorgu)
  );
}

/** Tüm kayıtları en yeniden eskiye sırala */
function banListele() {
  return Object.values(readBans()).sort((a, b) => b.tarihMs - a.tarihMs);
}

/** Belirli bir kullanıcının bildirdiği kayıtlar */
function banListeleBildiren(userId) {
  return Object.values(readBans())
    .filter(k => k.bildirenId === userId)
    .sort((a, b) => b.tarihMs - a.tarihMs);
}

module.exports = { getCfg, setCfg, banEkle, banSil, banGetir, banAra, banListele, banListeleBildiren };
