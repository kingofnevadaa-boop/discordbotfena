# 🎮 InGame Bot

Discord.js v14 ile yapılmış ingame katılma/ayrılma sistemi.

---

## 📁 Proje Yapısı

```
ingame-bot/
├── src/
│   ├── index.js                 ← Bot giriş noktası
│   ├── deploy-commands.js       ← Slash komutları kaydet
│   ├── commands/
│   │   └── ingame.js            ← /ingame ac | /ingame kapat
│   ├── handlers/
│   │   ├── commandHandler.js    ← Slash komut yönlendirici
│   │   └── buttonHandler.js     ← Buton olayları (katıl/ayrıl/bilgi)
│   └── utils/
│       ├── embedBuilder.js      ← Embed + buton oluşturucu
│       └── logger.js            ← Log kanalı
├── config.json                  ← Renk, emoji, yedek slot ayarları
├── .env                         ← Token ve ID'ler
└── package.json
```

---

## ⚙️ Kurulum

### 1. Bağımlılıkları yükle

```bash
npm install
```

### 2. `.env` dosyasını düzenle

```env
TOKEN=BOT_TOKEN_BURAYA
CLIENT_ID=BOT_CLIENT_ID_BURAYA
GUILD_ID=SUNUCU_ID_BURAYA
LOG_CHANNEL_ID=LOG_KANAL_ID_BURAYA
```

> **LOG_CHANNEL_ID** → Katılma/ayrılma loglarının atılacağı kanalın ID'si.

### 3. Slash komutları kaydet

```bash
npm run deploy
```

### 4. Botu başlat

```bash
npm start
```

---

## 🕹️ Komutlar

| Komut | Açıklama |
|---|---|
| `/ingame ac baslik:[...] limit:[N] aciklama:[...]` | Yeni ingame etkinliği başlatır |
| `/ingame kapat mesaj_id:[...]` | Mevcut bir ingame'i kapatır |

> Komutları kullanmak için **Etkinlikleri Yönet** yetkisi gereklidir.

---

## 🎯 Özellikler

| Özellik | Detay |
|---|---|
| **Katıl butonu** | Yeşil — limit dolunca 🟡 "Dolu - Yedek Ol" olur |
| **Ayrıl butonu** | Kırmızı — çıkınca bir sonraki yedek otomatik ana listeye alınır, DM ile bildirilir |
| **Bilgi butonu** | Mavi — kişiye özel (ephemeral) durum bilgisi |
| **Yedek sistemi** | 3 yedek slotu — `config.json`'dan değiştirilebilir |
| **Anlık güncelleme** | Her katılma/ayrılmada embed mesaj otomatik güncellenir |
| **Log kanalı** | Her işlem log kanalına embed olarak iletilir |
| **Kapat komutu** | Etkinliği kilitler, butonlar devre dışı kalır |

---

## 📋 config.json

```json
{
  "yedekSlot": 3,          ← Kaç yedek alınsın
  "renkler": { ... },      ← Embed renkleri
  "emojiler": { ... }      ← Emoji ayarları
}
```
