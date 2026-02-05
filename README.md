# YKS Boost - YKS Reels Platformu

[![Run on Replit](https://replit.com/badge/github/dunyadn/Yks-Boost)](https://replit.com/@doubleflyingfis/Yks-Boost)

YKS öğrencileri için soru odaklı sosyal medya platformu. Video paylaşımı olmadan, soru ve çözüm paylaşımına odaklanan modern bir mobil uygulama.

## 📥 APK İndirme

Android cihazınıza doğrudan kurulum için:

1. **GitHub Actions ile Build**:
   - Repository'nin "Actions" sekmesine gidin
   - "Build Android APK" workflow'unu çalıştırın
   - Build tamamlandıktan sonra "yksreels.apk" dosyasını indirin

2. **Manuel Build**:
   - Detaylı talimatlar için [ANDROID_APK_KILAVUZU.md](ANDROID_APK_KILAVUZU.md) dosyasına bakın
   - Veya `./scripts/build-apk.sh` script'ini çalıştırın

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
- 🎁 **Otomatik Soru Yükleme**: Uygulama ilk açıldığında örnek sorular otomatik olarak yüklenir

### Diğer Özellikler
- 📝 **Soru Ekle**: Modal form ile kolay soru paylaşımı
- 🔄 **Soru Dönüştürme**: Text dosyalarından JSON formatına otomatik soru dönüştürme
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
│   ├── lib/             # Utility fonksiyonlar (localStorage, initQuestions)
│   ├── navigation/      # Navigation yapılandırması
│   └── screens/         # Uygulama ekranları
├── server/              # Express.js backend
│   ├── db/             # Veritabanı yapılandırması
│   └── routes/         # API rotaları
├── shared/              # Frontend ve backend arasında paylaşılan kod
├── scripts/             # Build ve deployment scriptleri
│   └── converters/      # Soru dönüştürme araçları
├── assets/              # Uygulama varlıkları
│   └── questions/       # Otomatik yüklenen soru paketleri (JSON)
└── data/                # Soru dosyaları
    ├── text-files/      # Kaynak text dosyaları
    └── questions/       # Dönüştürülmüş JSON dosyaları
```

## 📖 Dokümantasyon

### 🎯 Geliştirici Dokümantasyonu
- **[Development Guide](DEVELOPMENT_GUIDE.md)** - **YENİ!** Kapsamlı geliştirme rehberi
- **[Architecture](ARCHITECTURE.md)** - **YENİ!** Sistem mimarisi ve design patterns
- **[API Documentation](API_DOCUMENTATION.md)** - **YENİ!** API endpoint'leri ve kullanım
- **[Contributing](CONTRIBUTING.md)** - **YENİ!** Katkıda bulunma rehberi
- **[Changelog](CHANGELOG.md)** - **YENİ!** Versiyon geçmişi

### 📚 Kullanıcı Dokümantasyonu
- [Replit Expo Setup](REPLIT_EXPO_SETUP.md) - Replit'te çalıştırma talimatları
- [Quick Start: Soru Dönüştürme](QUICK_START_CONVERTER.md) - PDF/TXT soru dönüştürme hızlı başlangıç
- [Comprehensive Converter Guide](COMPREHENSIVE_CONVERTER_GUIDE.md) - Detaylı dönüştürme kılavuzu
- [Conversion Guide](CONVERSION_GUIDE.md) - Text dosyalarını JSON'a dönüştürme rehberi
- [Text Format Examples](TEXT_FORMAT_EXAMPLES.md) - Desteklenen text formatları
- [JSON Format Guide](JSON_FORMAT_GUIDE.md) - JSON soru formatı kılavuzu
- [Auto-loaded Questions](assets/questions/README.md) - Otomatik yüklenen soru paketleri
- [Testing Guide](TESTING_GUIDE.md) - Test etme rehberi
- [Visual Guide](VISUAL_GUIDE.md) - Görsel tasarım rehberi
- [Soru Ekleme Kılavuzu](SORU_EKLEME_KILAVUZU.md) - Soru ekleme rehberi
- [Design Guidelines](design_guidelines.md) - Tasarım kuralları

## ⚡ Otomatik Soru Yükleme

Uygulama ilk kez başlatıldığında, `assets/questions/` dizinindeki tüm soru paketleri otomatik olarak AsyncStorage'a yüklenir:

- ✅ **24 örnek soru** (3 paket: Tarih, Matematik, Fizik)
- 🔒 **Bir kez yükleme**: Veriler cihazda kalıcı olarak saklanır
- 🚀 **Anında kullanıma hazır**: Hiçbir ek işlem gerektirmez
- 📱 **Offline çalışma**: İnternet bağlantısı gerekmez

Yeni soru paketleri eklemek için `assets/questions/README.md` dosyasına bakın.

## 🧪 Test ve Build

```bash
# Testler
npm test              # Tüm testleri çalıştır
npm run test:watch    # Watch mode
npm run test:ci       # CI için testler

# Text dosyasını JSON'a dönüştür (tekil)
npm run convert-questions <input.txt> <output.json> -- --package-name "Paket Adı" --exam-type TYT

# Toplu dönüştürme (dizindeki tüm PDF/TXT dosyaları)
npm run convert-bulk <kaynak-dizin> <hedef-dizin>

# AI destekli detaylı çözümlerle toplu dönüştürme
npm run convert-bulk <kaynak-dizin> <hedef-dizin> -- --api-key YOUR_GEMINI_API_KEY

# Kod Kalitesi
npm run check:types   # Tip kontrolü
npm run lint          # Linting
npm run format        # Code formatting
npm run validate      # Tüm kontroller (types + lint + test)

# Production build
npm run expo:static:build
npm run server:build

# Production sunucu
npm run server:prod
```

## 🛠 Yeni Geliştirici Araçları

### Logger Utility
Merkezi log yönetimi için:
```typescript
import { logger } from '@/utils/logger';

logger.info('İşlem başarılı');
logger.error('Hata oluştu', error);
```

### Performance Monitor
Performans izleme:
```typescript
import { performanceMonitor } from '@/utils/performance';

const result = await performanceMonitor.measure('api-call', async () => {
  return await fetchData();
});
```

### API Client
Gelişmiş API client (otomatik retry, error handling):
```typescript
import { apiClient } from '@/utils/apiClient';

const data = await apiClient.get('/api/questions');
```

### Validation
Zod ile veri doğrulama:
```typescript
import { validate, QuestionSchema } from '@/utils/validation';

const validQuestion = validate(QuestionSchema, data);
```

Detaylar için [Development Guide](DEVELOPMENT_GUIDE.md)'a bakın.

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
