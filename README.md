# YKS Boost - YKS Sosyal Medya Platformu

[![Run on Replit](https://replit.com/badge/github/dunyadn/Yks-Boost)](https://replit.com/@doubleflyingfis/Yks-Boost)

YKS öğrencileri için soru odaklı sosyal medya platformu. Video paylaşımı olmadan, soru ve çözüm paylaşımına odaklanan modern bir mobil uygulama.

## 🚀 Hızlı Başlangıç

### Replit'te Çalıştır

Projeyi Replit'te çalıştırmak için yukarıdaki "Run on Replit" butonuna tıklayın veya doğrudan [buradan](https://replit.com/@doubleflyingfis/Yks-Boost) erişin.

Replit'te çalıştırma:
1. "Run" butonuna basın
2. Uygulama otomatik olarak backend ve frontend servislerini başlatacak
3. Expo Go ile mobil uygulamayı test edebilirsiniz

Detaylı Replit kurulum talimatları için [REPLIT_EXPO_SETUP.md](REPLIT_EXPO_SETUP.md) dosyasına bakın.

### Yerel Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Backend sunucusunu başlat (port 5000)
npm run server:dev

# Frontend (Expo) sunucusunu başlat (port 8081)
npm run expo:dev
```

## 📱 Özellikler

### YKS Reels (Temel Özellik)
- 📊 Dikey kaydırmalı tam ekran soru kartları
- ✅ Tıklanabilir A-B-C-D-E şıkları
- 🎯 Cevap seçildiğinde anında geri bildirim
  - Doğru cevap yeşil renkte gösterilir
  - Yanlış seçim kırmızı renkte gösterilir
  - Çözüm otomatik olarak görünür
- ❤️ Beğen, yorum, kaydet, paylaş aksiyonları
- 📳 Haptic geri bildirim

### Diğer Özellikler
- 📝 **Soru Ekle**: Modal form ile kolay soru paylaşımı
- ✓ **Görevlerim**: Çalışma hedefleri oluşturma ve ilerleme takibi
- 📚 **Kütüphane**: Kayıtlı sorular, ders bazlı filtreleme
- 👥 **Topluluk**: Telegram benzeri sohbet sistemi
- 👤 **Profil**: Kullanıcı profili, rozetler, istatistikler

## 🛠 Teknoloji Yığını

- **Frontend:** React Native + Expo
- **Backend:** Express.js + PostgreSQL
- **Navigasyon:** React Navigation 7+
- **State Management:** React Query + useState
- **UI Components:** Custom components with Reanimated animations
- **Fonts:** Nunito (Google Fonts)
- **Database:** PostgreSQL 16 + Drizzle ORM

## 🎨 Tasarım Dili

- **Tema:** Koyu (Dark mode only)
- **Arka Plan:** #0A0A0F (koyu lacivert)
- **Birincil Renk:** #00E5FF (neon mavi)
- **İkincil Renk:** #B620E0 (neon mor)
- **Vurgu Renk:** #FF006E (neon pembe/kırmızı)
- **Başarı:** #00E676 (yeşil)

## 📂 Proje Yapısı

```
.
├── client/               # React Native (Expo) uygulaması
│   ├── components/       # Yeniden kullanılabilir UI bileşenleri
│   ├── constants/        # Tema ve sabitler
│   ├── hooks/           # Custom hooks
│   ├── navigation/      # Navigation yapılandırması
│   └── screens/         # Uygulama ekranları
├── server/              # Express.js backend
│   ├── db/             # Veritabanı yapılandırması
│   └── routes/         # API rotaları
├── shared/              # Frontend ve backend arasında paylaşılan kod
└── scripts/             # Build ve deployment scriptleri
```

## 📖 Dokümantasyon

- [Replit Expo Setup](REPLIT_EXPO_SETUP.md) - Replit'te çalıştırma talimatları
- [Testing Guide](TESTING_GUIDE.md) - Test etme rehberi
- [Visual Guide](VISUAL_GUIDE.md) - Görsel tasarım rehberi
- [Soru Ekleme Kılavuzu](SORU_EKLEME_KILAVUZU.md) - Soru ekleme rehberi
- [Design Guidelines](design_guidelines.md) - Tasarım kuralları

## 🧪 Test ve Build

```bash
# Tip kontrolü
npm run check:types

# Linting
npm run lint

# Code formatting
npm run format

# Production build
npm run expo:static:build
npm run server:build

# Production sunucu
npm run server:prod
```

## 🔐 Güvenlik

Güvenlik bildirimleri için [SECURITY_NOTICE.md](SECURITY_NOTICE.md) dosyasına bakın.

## 📄 Lisans

Bu proje özel bir proje olup, tüm hakları saklıdır.

## 🤝 Katkıda Bulunma

Bu özel bir proje olduğundan, katkılar proje sahiplerinin onayına tabidir.

## 📞 İletişim

Sorularınız için GitHub issues kullanabilirsiniz.

---

**Not:** Bu uygulama Replit üzerinde geliştirilmiş ve host edilmiştir. En iyi deneyim için Replit ortamında çalıştırılması önerilir.
