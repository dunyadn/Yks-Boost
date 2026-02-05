# YKS Sosyal - Android APK Oluşturma ve Kurulum Kılavuzu

Bu kılavuz, YKS Sosyal uygulamasının Android APK dosyasını oluşturmak ve Android 14 cihazınıza kurmak için gereken adımları açıklar.

## 📋 Gereksinimler

- Node.js (v18 veya üzeri)
- npm veya yarn
- Expo CLI
- EAS CLI
- Expo hesabı (ücretsiz)

## 🚀 Kurulum Adımları

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. EAS CLI'ı Global Olarak Yükleyin

```bash
npm install -g eas-cli
```

### 3. Expo Hesabına Giriş Yapın

```bash
eas login
```

Hesabınız yoksa [expo.dev](https://expo.dev) adresinden ücretsiz hesap oluşturabilirsiniz.

### 4. APK Oluşturun

#### Önizleme APK'sı (Önerilen - Doğrudan Kurulabilir)

```bash
npm run build:android
```

veya doğrudan:

```bash
eas build --platform android --profile preview
```

#### Geliştirme APK'sı

```bash
npm run build:android:dev
```

#### Üretim APK'sı

```bash
npm run build:android:prod
```

### 5. APK'yı İndirin

Build tamamlandıktan sonra:

1. Terminal'de görünen indirme bağlantısını tıklayın
2. VEYA [expo.dev](https://expo.dev) hesabınıza giriş yapın
3. "Builds" sekmesine gidin
4. Son build'i bulun ve "Download" butonuna tıklayın

## 📱 Android 14 Cihazınıza Kurulum

### APK'yı Cihazınıza Aktarın

**Yöntem 1: USB ile**
1. Telefonunuzu bilgisayara USB ile bağlayın
2. Dosya aktarım modunu seçin
3. APK dosyasını telefonunuzun "Download" klasörüne kopyalayın

**Yöntem 2: Bulut Depolama ile**
1. APK'yı Google Drive veya başka bir bulut hizmetine yükleyin
2. Telefonunuzda uygulamayı açıp indirin

**Yöntem 3: E-posta ile**
1. APK dosyasını kendinize e-posta ile gönderin
2. Telefonunuzda e-postayı açıp eki indirin

### APK'yı Kurun

1. **Bilinmeyen Kaynaklara İzin Verin:**
   - Ayarlar > Uygulamalar > Özel uygulama erişimi > Bilinmeyen uygulamaları yükle
   - Dosya yöneticisi veya indirme uygulamanız için izin verin

2. **APK'yı Açın:**
   - Dosya yöneticisini açın
   - APK dosyasını bulun
   - Üzerine tıklayın

3. **Kurulumu Tamamlayın:**
   - "Yükle" butonuna tıklayın
   - Kurulum tamamlandıktan sonra "Aç" butonuna tıklayın

## ⚠️ Android 14 Özel Notları

Android 14 (API 34) için özel izinler yapılandırılmıştır:

- **INTERNET**: Sunucuyla iletişim için
- **CAMERA**: Soru fotoğrafı çekmek için
- **READ_MEDIA_IMAGES**: Galeriden resim seçmek için
- **READ_MEDIA_VIDEO**: Video içerikleri için
- **POST_NOTIFICATIONS**: Bildirimler için

İlk açılışta uygulama bu izinleri isteyecektir. Tüm özellikleri kullanabilmek için izinleri kabul edin.

## 🔧 Sorun Giderme

### "Bilinmeyen uygulama" uyarısı
Bu normal bir güvenlik uyarısıdır. "Yine de yükle" seçeneğine tıklayın.

### Build başarısız olursa
```bash
# Cache'i temizleyin
npx expo start --clear

# Node modüllerini yeniden yükleyin
rm -rf node_modules
npm install

# EAS build'i tekrar deneyin
eas build --platform android --profile preview --clear-cache
```

### Uygulama açılmıyor
- Telefonunuzu yeniden başlatın
- Uygulamayı kaldırıp tekrar yükleyin
- Android sürümünüzün 6.0 veya üzeri olduğundan emin olun

## 📊 Build Profilleri

| Profil | Açıklama | Kullanım |
|--------|----------|----------|
| `development` | Geliştirme modu, debug araçları aktif | Test ve hata ayıklama için |
| `preview` | Optimize edilmiş, doğrudan kurulabilir APK | Normal kullanım için önerilen |
| `production` | Tam optimize edilmiş üretim sürümü | Mağaza yayını için |

## 🔐 Güvenlik

- APK dosyasını sadece güvendiğiniz kaynaklardan indirin
- Uygulamayı yüklemeden önce Android'in güvenlik taramasını bekleyin
- Sorunlu gördüğünüz bir şey varsa kurulumu iptal edin

## 📞 Destek

Sorun yaşarsanız:
1. GitHub Issues sayfasından yeni bir issue açın
2. Hata mesajının ekran görüntüsünü ekleyin
3. Android sürümünüzü ve cihaz modelinizi belirtin

---

**Başarılı kurulum!** 🎉 YKS Sosyal uygulamasını kullanmaya hazırsınız.
