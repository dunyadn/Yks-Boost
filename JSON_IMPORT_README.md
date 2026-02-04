# JSON Soru Ekleme ve Silme Özellikleri

## 📝 Genel Bakış

YKS Boost uygulamasına artık iki yeni özellik eklendi:
1. **JSON Dosyası ile Toplu Soru Ekleme**
2. **Sorular Ekranında Soru Silme**

## 🎯 JSON ile Soru Ekleme

### JSON Dosya Formatı

JSON dosyanız aşağıdaki formatta olmalıdır:

```json
[
  {
    "content": "Soru metni buraya",
    "options": [
      "A şıkkı",
      "B şıkkı", 
      "C şıkkı",
      "D şıkkı"
    ],
    "correctAnswer": "B",
    "category": "Matematik"
  },
  {
    "content": "Başka bir soru",
    "options": ["Şık 1", "Şık 2", "Şık 3", "Şık 4"],
    "correctAnswer": "A",
    "category": "Fizik"
  }
]
```

### Zorunlu Alanlar

Her soru için:
- ✅ `content` (string): Soru metni
- ✅ `options` (array): En az 2 şık içeren dizi
- ✅ `correctAnswer` (string): Doğru cevap (A, B, C, D, veya E)
- ⚠️ `category` (string, opsiyonel): Kategori (varsayılan: "Genel")

### Desteklenen Kategoriler

- Matematik
- Fizik
- Kimya
- Biyoloji
- Türkçe
- Tarih
- Coğrafya
- Genel (varsayılan)

### Nasıl Kullanılır

1. **Dosyanızı Hazırlayın**
   - Yukarıdaki formatta bir JSON dosyası oluşturun
   - `example-questions.json` dosyasını örnek olarak kullanabilirsiniz

2. **Uygulamada Yükleme**
   - "PDF Yükle" sekmesine gidin
   - "JSON Seç" butonuna tıklayın
   - JSON dosyanızı seçin
   - "Soruları Ekle" butonuna basın

3. **Sonuç**
   - Başarılı olursa: "X soru başarıyla eklendi!" mesajı görünür
   - Sorular "Reels" sekmesinde görünür
   - Hatalı sorular varsa detaylı hata mesajları gösterilir

### Hata Mesajları

- ❌ "JSON dosyası bir soru dizisi içermelidir" - Dosya array değil
- ❌ "Question X: Missing required fields" - Zorunlu alan eksik
- ❌ "Question X: Must have at least 2 options" - En az 2 şık gerekli

## 🗑️ Soru Silme Özelliği

### Nasıl Kullanılır

1. **Reels Sekmesinde**
   - Silmek istediğiniz soruya kaydırın
   - Sağ tarafta "Çöp Kutusu" ikonuna tıklayın
   - Onay dialogu açılır

2. **Onaylama**
   - "Sil" butonuna basın → Soru kalıcı olarak silinir
   - "İptal" butonuna basın → İşlem iptal edilir

3. **Sonuç**
   - ✅ Soru başarıyla silindi: Yeşil onay hissi
   - ❌ Hata oluştu: Kırmızı hata hissi ve mesaj

### Önemli Notlar

- ⚠️ Silme işlemi **geri alınamaz**
- 🔄 Soru sunucudan ve yerel listeden kaldırılır
- 📱 Haptic feedback ile kullanıcı bilgilendirilir

## 📊 Örnekler

### Örnek JSON Dosyası

`example-questions.json` dosyasını projenin kök dizininde bulabilirsiniz. Bu dosya 5 farklı kategoriden örnek sorular içerir:
- Türkçe
- Matematik
- Fizik
- Kimya
- Tarih

### Kullanım Senaryosu

```
1. Kullanıcı: example-questions.json dosyasını indirir
2. Kullanıcı: "PDF Yükle" sekmesine gider
3. Kullanıcı: "JSON Seç" butonuna tıklar
4. Kullanıcı: example-questions.json dosyasını seçer
5. Kullanıcı: "Soruları Ekle" butonuna basar
6. Sistem: 5 soru başarıyla eklendi! mesajı gösterir
7. Kullanıcı: "Reels" sekmesine gider
8. Kullanıcı: Yeni soruları görür ve çözer
9. Kullanıcı: Bir soruyu silmek ister
10. Kullanıcı: Çöp kutusu ikonuna tıklar
11. Sistem: Onay dialogu gösterir
12. Kullanıcı: "Sil" butonuna basar
13. Sistem: Soru silindi ve listeden kaldırıldı
```

## 🔧 Teknik Detaylar

### API Endpoints

#### JSON Upload
```
POST /api/upload-json
Content-Type: application/json

Body: [Array of question objects]

Response:
{
  "success": true,
  "questionsAdded": 5,
  "totalQuestions": 5,
  "errors": [] // Eğer hata varsa
}
```

#### Question Delete
```
DELETE /api/questions/:id

Response: 200 OK
```

### Client-Side Değişiklikler

1. **PDFUploadScreen.tsx**
   - Yeni `handlePickJSON()` fonksiyonu
   - Güncellenmiş `handleUpload()` - hem PDF hem JSON destekler
   - İki upload butonu: PDF ve JSON

2. **ReelsScreen.tsx**
   - Yeni `handleDelete()` fonksiyonu
   - Onay dialogu
   - Çöp kutusu ikonu action button

### Server-Side Değişiklikler

1. **routes.ts**
   - Yeni `POST /api/upload-json` endpoint
   - JSON validasyonu
   - Toplu soru ekleme
   - Detaylı hata raporlama

## ⚠️ Sınırlamalar

- Maksimum dosya boyutu: 10 MB
- JSON dosyası geçerli JSON formatında olmalı
- Her soru en az 2 şık içermeli
- Doğru cevap A, B, C, D veya E olmalı

## 🎉 Avantajlar

- ✅ **Hızlı**: Yüzlerce soruyu saniyeler içinde ekleyin
- ✅ **Toplu**: Tek seferde birçok soru yükleyin
- ✅ **Esnek**: PDF ve JSON arasında seçim yapın
- ✅ **Güvenli**: Soru silmeden önce onay istenir
- ✅ **Kullanıcı Dostu**: Açık hata mesajları ve feedback

## 📚 İleri Okuma

- PDF upload özellikleri için: `PDF_UPLOAD_FIX_SUMMARY.md`
- Test senaryoları için: `PDF_UPLOAD_FIX_TESTING.md`
- Proje genel bilgiler için: `README.md`
