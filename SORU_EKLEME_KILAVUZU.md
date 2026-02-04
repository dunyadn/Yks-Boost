# Soru Ekleme Özelliği Test Kılavuzu

## Sorun
Kullanıcı JSON formatında sorular eklemeye çalışırken:
- Sorular kütüphaneye/depoya eklenmiyor
- Hata mesajları gösterilmiyor
- API gerektirmeyen, çevrimdışı çalışan bir çözüm gerekiyor (APK için)

## Çözüm
1. **Sunucu Tarafı**: Bellek içi depolamadan dosya tabanlı kalıcı depolamaya geçildi
2. **İstemci Tarafı**: API bağımlılığı kaldırıldı, AsyncStorage kullanılarak tamamen çevrimdışı çalışma sağlandı

## Değişiklikler

### Sunucu Tarafı (Opsiyonel - APK için gerekmez)
- `server/fileStorage.ts`: JSON dosyasına kalıcı kayıt yapan yeni depolama
- `server/storage.ts`: FileStorage kullanacak şekilde güncellendi
- `server/index.ts`: Uygulama başlangıcında storage başlatma eklendi
- Veriler `/data/storage.json` dosyasına kaydediliyor

### İstemci Tarafı (APK için asıl çözüm)
- `client/lib/localStorage.ts`: AsyncStorage kullanarak tamamen yerel veri yönetimi
- `client/screens/PDFUploadScreen.tsx`: API yerine yerel storage kullanımı
- `client/screens/ReelsScreen.tsx`: API yerine yerel storage kullanımı
- `client/screens/StatisticsScreen.tsx`: API yerine yerel storage kullanımı
- `client/screens/ProfileScreen.tsx`: API yerine yerel storage kullanımı

## Nasıl Kullanılır

### 1. Soru Ekleme
1. Uygulamada "PDF Upload" sekmesine gidin
2. Örnek JSON formatını inceleyin veya "Kullan" butonuna tıklayın
3. JSON verisini düzenleyin veya kendi JSON'unuzu yapıştırın
4. "Soruları Ekle" butonuna tıklayın
5. Başarı mesajı görüntülenecek

### 2. Soruları Görüntüleme
1. "Reels" sekmesine gidin
2. Eklediğiniz sorular burada görüntülenecek
3. Soruları çözerek ilerleyebilirsiniz

### 3. İstatistikleri Görüntüleme
1. "Statistics" sekmesine gidin
2. Paket bazlı başarı oranlarını görebilirsiniz
3. Konu bazlı yanlış analizini görebilirsiniz

## Örnek JSON Formatı

```json
{
  "packageName": "TYT 2025 Matematik",
  "examType": "TYT",
  "year": 2025,
  "description": "2025 TYT Matematik Soruları",
  "questions": [
    {
      "content": "2x + 5 = 15 denkleminin çözümü nedir?",
      "options": [
        "x = 3",
        "x = 5",
        "x = 7",
        "x = 10",
        "x = 15"
      ],
      "correctAnswer": "B",
      "category": "Matematik",
      "subject": "Denklemler"
    }
  ]
}
```

## Önemli Notlar

### Çevrimdışı Çalışma
- ✅ Tüm sorular AsyncStorage'da saklanır
- ✅ İnternet bağlantısı gerektirmez
- ✅ APK olarak çalıştığında tamamen bağımsızdır
- ✅ Uygulama kapanıp açılsa bile veriler korunur

### Hata Mesajları
Artık tüm hatalar kullanıcıya gösterilir:
- Geçersiz JSON formatı
- Eksik zorunlu alanlar (packageName, examType, questions)
- Boş soru listesi
- Storage hataları

### Veri Güvenliği
- Veriler cihazda AsyncStorage içinde saklanır
- Uygulama silinmedikçe veriler korunur
- Manuel yedekleme özelliği eklenebilir (gelecekte)

## Test Adımları

1. Uygulamayı başlatın
2. PDF Upload sekmesine gidin
3. Örnek JSON'u kullanın veya kendi JSON'unuzu ekleyin
4. "Soruları Ekle" butonuna tıklayın
5. Başarı mesajını doğrulayın
6. Reels sekmesine gidip soruları görün
7. Uygulamayı kapatıp tekrar açın
8. Soruların hala orada olduğunu doğrulayın

## Sorun Giderme

### Sorular görünmüyor
- AsyncStorage'ı temizleyin: Ayarlar > Uygulama > YKS Boost > Depolamayı Temizle
- Uygulamayı yeniden başlatın

### JSON hatası alıyorum
- JSON formatının doğru olduğundan emin olun
- Tüm zorunlu alanların (packageName, examType, questions) mevcut olduğunu kontrol edin
- Her sorunun content, options, correctAnswer, category alanlarını kontrol edin

### APK Build
APK oluştururken:
```bash
npx expo build:android
```
veya
```bash
eas build --platform android
```
