# YKS Reels - Android APK Oluşturma ve Kurulum Kılavuzu

Bu kılavuz, YKS Reels uygulamasının Android APK dosyasını oluşturmak ve Android cihazınıza kurmak için gereken adımları açıklar.

## 🚀 GitHub Actions ile APK Oluşturma (Önerilen)

GitHub Actions kullanarak APK oluşturmak en kolay yöntemdir:

### 1. EXPO_TOKEN Secret Ekleme

1. [expo.dev](https://expo.dev) adresine giriş yapın
2. Hesap ayarlarına gidin: **Settings** > **Access tokens**
3. **Create token** butonuna tıklayın
4. Token'a bir isim verin (örn: `github-actions`)
5. Token'ı kopyalayın
6. GitHub repository ayarlarına gidin: **Settings** > **Secrets and variables** > **Actions**
7. **New repository secret** butonuna tıklayın
8. İsim: `EXPO_TOKEN`, Değer: kopyaladığınız token
9. **Add secret** butonuna tıklayın

### 2. Build Android APK Workflow Çalıştırma

1. GitHub repository'de **Actions** sekmesine gidin
2. Sol tarafta **Build Android APK** workflow'unu seçin
3. **Run workflow** butonuna tıklayın
4. Build profile'ı seçin (önerilen: `preview`)
5. **Run workflow** yeşil butonuna tıklayın

### 3. APK İndirme

1. Workflow tamamlandığında (yeşil tik işareti görünür)
2. Workflow run'a tıklayın
3. **Artifacts** bölümünde `yksreels-apk` dosyasını bulun
4. İndirmek için tıklayın
5. Zip dosyasını açın ve `yksreels.apk` dosyasını çıkarın

---

## 📱 Hızlı Başlangıç (Otomatik Script)

APK oluşturmanın en kolay yolu, hazırladığımız script'i kullanmaktır:

```bash
# Script'i çalıştırın
./scripts/build-apk.sh
```

Bu script sizi adım adım yönlendirecektir.

---

## 📋 Gereksinimler

- Node.js (v18 veya üzeri)
- npm veya yarn
- Expo CLI
- EAS CLI
- Expo hesabı (ücretsiz) - [expo.dev](https://expo.dev)

## 🚀 Manuel Kurulum Adımları

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

#### 🌟 Yöntem 1: EAS Build (Önerilen - Bulut Tabanlı)

En kolay ve önerilen yöntem. İnternet bağlantısı ve Expo hesabı gerektirir.

**Önizleme APK'sı (Doğrudan Kurulabilir):**

```bash
npm run build:android
```

veya doğrudan:

```bash
eas build --platform android --profile preview
```

**Geliştirme APK'sı:**

```bash
npm run build:android:dev
```

**Üretim APK'sı:**

```bash
npm run build:android:prod
```

#### 🔧 Yöntem 2: Lokal Build (Android SDK Gerekli)

Bilgisayarınızda Android SDK kurulu olmalıdır.

```bash
# Android SDK yolunu ayarlayın
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Android projesini oluşturun
npx expo prebuild --platform android --clean

# APK'yı derleyin
cd android
./gradlew assembleRelease

# APK dosyası: android/app/build/outputs/apk/release/app-release.apk
```

### 5. APK'yı İndirin

EAS Build tamamlandıktan sonra:

1. Terminal'de görünen indirme bağlantısını tıklayın
2. VEYA [expo.dev](https://expo.dev) hesabınıza giriş yapın
3. "Builds" sekmesine gidin
4. Son build'i bulun ve "Download" butonuna tıklayın

APK dosyasını `yksreels.apk` olarak yeniden adlandırabilirsiniz.

## 📱 Android Cihazınıza Kurulum

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

**Yöntem 4: GitHub Releases**
1. Repository'nin Releases sayfasına gidin
2. En son sürümü bulun
3. Assets kısmından `yksreels.apk` dosyasını indirin

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

## ⚠️ Android İzinleri

Uygulama için gerekli izinler:

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

### Lokal build başarısız olursa
```bash
# Android projesini temizleyin
rm -rf android

# Yeniden oluşturun
npx expo prebuild --platform android --clean

# Tekrar deneyin
cd android && ./gradlew clean assembleRelease
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

**Başarılı kurulum!** 🎉 YKS Reels uygulamasını kullanmaya hazırsınız.
