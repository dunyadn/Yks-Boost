# JSON İçe Aktarma ve Soru Silme - Görsel Kılavuz

## 🎯 Yeni Özellikler

Bu güncelleme ile iki önemli özellik eklendi:
1. **JSON ile Toplu Soru Ekleme**
2. **Reels'te Soru Silme**

---

## 📥 JSON ile Soru Ekleme

### Önceki Durum ❌
```
┌─────────────────────────────┐
│   PDF'ten Soru Ekle         │
├─────────────────────────────┤
│                             │
│   [PDF Seç]                 │
│   Dokunarak PDF seçin       │
│                             │
│   [Soruları Ekle]           │
└─────────────────────────────┘

❌ Sadece PDF yükleme
❌ Tek tek soru ekleme
❌ JSON desteği yok
```

### Yeni Durum ✅
```
┌─────────────────────────────┐
│      Soru Ekle              │
├─────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ │
│ │   📄     │ │    { }    │ │
│ │  PDF Seç │ │ JSON Seç  │ │
│ │ AI ile   │ │  Toplu    │ │
│ │  çıkarma │ │  ekleme   │ │
│ └───────────┘ └───────────┘ │
│                             │
│   [Soruları Ekle]           │
└─────────────────────────────┘

✅ PDF veya JSON seçimi
✅ İki farklı yöntem
✅ Toplu ekleme desteği
```

### JSON Dosya Formatı

```json
[
  {
    "content": "Soru metni buraya",
    "options": [
      "A şıkkı buraya",
      "B şıkkı buraya",
      "C şıkkı buraya",
      "D şıkkı buraya"
    ],
    "correctAnswer": "B",
    "category": "Matematik"
  }
]
```

### Kullanım Adımları

#### 1️⃣ JSON Dosyası Hazırlayın
```
example-questions.json dosyasını kullanabilirsiniz
veya kendi dosyanızı yukarıdaki formatta oluşturun
```

#### 2️⃣ Uygulamada Yükleyin
```
1. Alt menüden "PDF Yükle" sekmesine gidin
2. "JSON Seç" butonuna dokunun
3. JSON dosyanızı seçin
4. "Soruları Ekle" butonuna basın
```

#### 3️⃣ İlerlemeyi İzleyin
```
📄 JSON dosyası hazırlanıyor...
    ⬇️
📄 JSON yükleniyor...
    ⬇️
📝 Sorular işleniyor...
    ⬇️
💾 Sorular kaydediliyor...
    ⬇️
✅ Tamamlandı!
```

#### 4️⃣ Sonucu Görün
```
┌─────────────────────────────┐
│      Başarılı! 🎉          │
├─────────────────────────────┤
│                             │
│  5 soru başarıyla eklendi!  │
│                             │
│  Reels sekmesinden soruları │
│  görebilirsiniz.            │
│                             │
│         [Tamam]             │
└─────────────────────────────┘
```

---

## 🗑️ Soru Silme Özelliği

### Önceki Durum ❌
```
┌─────────────────────────────┐
│         REELS               │
├─────────────────────────────┤
│                             │
│  Soru metni burada...       │
│                             │
│  A) Şık 1                   │
│  B) Şık 2                   │
│  C) Şık 3                   │
│  D) Şık 4                   │
│                             │
│              ┌─┐            │
│              │♥│ 234        │
│              │🔖│           │
│              └─┘            │
└─────────────────────────────┘

❌ Soru silinemez
❌ Sadece beğeni ve kaydetme
```

### Yeni Durum ✅
```
┌─────────────────────────────┐
│         REELS               │
├─────────────────────────────┤
│                             │
│  Soru metni burada...       │
│                             │
│  A) Şık 1                   │
│  B) Şık 2                   │
│  C) Şık 3                   │
│  D) Şık 4                   │
│                             │
│              ┌─┐            │
│              │♥│ 234        │
│              │🔖│           │
│              │🗑│ ← YENİ!   │
│              └─┘            │
└─────────────────────────────┘

✅ Çöp kutusu ikonu eklendi
✅ Soruları silebilirsiniz
✅ Onay dialogu ile güvenli
```

### Silme Adımları

#### 1️⃣ Soruya Gidin
```
Reels sekmesinde silmek istediğiniz soruya kaydırın
```

#### 2️⃣ Çöp Kutusu İkonuna Dokunun
```
Sağ taraftaki 🗑️ ikonuna tıklayın
```

#### 3️⃣ Onaylayın
```
┌─────────────────────────────┐
│      Soruyu Sil             │
├─────────────────────────────┤
│                             │
│  Bu soruyu kalıcı olarak    │
│  silmek istediğinize emin   │
│  misiniz?                   │
│                             │
│   [İptal]      [Sil]        │
└─────────────────────────────┘
```

#### 4️⃣ Sonuç
```
✅ "Sil" → Soru kalıcı olarak silinir
   - Yeşil titreşim hissi
   - Soru listeden kaybolur

❌ "İptal" → Hiçbir şey olmaz
   - İşlem iptal edilir
```

---

## 📊 Karşılaştırma Tablosu

| Özellik | Önce | Sonra |
|---------|------|-------|
| PDF Yükleme | ✅ Var | ✅ Var |
| JSON Yükleme | ❌ Yok | ✅ **YENİ!** |
| Toplu Soru Ekleme | ❌ Yok | ✅ **YENİ!** |
| Soru Silme | ❌ Yok | ✅ **YENİ!** |
| Silme Onayı | - | ✅ **YENİ!** |
| Haptik Geri Bildirim | Kısıtlı | ✅ Geliştirildi |
| Detaylı Hata Mesajları | Kısıtlı | ✅ Geliştirildi |

---

## 💡 Kullanım Senaryoları

### Senaryo 1: Toplu Soru Ekleme
```
Durum: 50 sorunuz var ve hepsini bir anda eklemek istiyorsunuz

Çözüm:
1. Soruları JSON formatında düzenleyin
2. example-questions.json formatını takip edin
3. "JSON Seç" ile yükleyin
4. 1 saniyede 50 soru ekleyin!

Avantaj:
⚡ Çok hızlı (saniyeler)
📦 Toplu işlem
✅ Tek seferde tamamlanır
```

### Senaryo 2: Hatalı Soru Temizleme
```
Durum: Yanlış eklenmiş soruları silmek istiyorsunuz

Çözüm:
1. Reels'te soruya gidin
2. 🗑️ ikonuna dokunun
3. "Sil" ile onaylayın
4. Soru kalıcı olarak silindi!

Avantaj:
🎯 Tek tuşla silme
✅ Yanlışlıkla silmeyi önleyen onay
🔄 Anında güncellenme
```

### Senaryo 3: Kategori Bazlı Ekleme
```
Durum: Farklı derslerden sorular eklemek istiyorsunuz

Çözüm:
1. Her ders için ayrı JSON dosyası hazırlayın:
   - matematik-sorular.json
   - fizik-sorular.json
   - kimya-sorular.json

2. Sırayla her birini yükleyin

3. Her dosya için ayrı kategori belirtin

Avantaj:
📚 Düzenli organizasyon
🎯 Kategori bazlı çalışma
📊 Kolay takip
```

---

## ⚠️ Önemli Notlar

### JSON Dosyası Hazırlarken
- ✅ Dosya uzantısı `.json` olmalı
- ✅ Geçerli JSON formatı kullanın
- ✅ Her soru için `content`, `options`, `correctAnswer` zorunlu
- ✅ En az 2 şık olmalı
- ❌ Türkçe karakterlerde sorun yok (UTF-8)

### Soru Silerken
- ⚠️ Silme işlemi **geri alınamaz**
- ✅ Mutlaka onay dialogu çıkar
- ✅ Sunucudan ve yerel listeden silinir
- 💡 Emin değilseniz "İptal" deyin

### Performans İpuçları
- 📊 100'den az soru → Sorunsuz çalışır
- 📊 100-500 soru → Biraz bekleyin
- 📊 500+ soru → Dosyayı bölün

---

## 🎓 Örnek JSON Dosyası

Proje klasöründe `example-questions.json` dosyası mevcut:

```json
[
  {
    "content": "Aşağıdaki cümlelerin hangisinde noktalama yanlışı vardır?",
    "options": [
      "Dün akşam sinemaya gittik",
      "Kahvaltıda peynir ve zeytin yedim.",
      "Bugün hava çok güzel.",
      "Yarın sınav olacağını biliyordum."
    ],
    "correctAnswer": "A",
    "category": "Türkçe"
  },
  {
    "content": "2x + 3 = 11 denkleminde x kaçtır?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": "B",
    "category": "Matematik"
  },
  ...
]
```

Bu dosyayı:
- ✅ Doğrudan kullanabilirsiniz
- ✅ Şablon olarak kullanabilirsiniz
- ✅ Kendi sorularınızı ekleyebilirsiniz

---

## 🚀 Başlarken

1. **İlk Test:**
   ```
   - example-questions.json dosyasını kullanın
   - "JSON Seç" ile yükleyin
   - 5 sorunun eklendiğini görün
   ```

2. **Kendi Sorularınızı Ekleyin:**
   ```
   - example-questions.json'ı kopyalayın
   - Kendi sorularınızla değiştirin
   - Yükleyin ve test edin
   ```

3. **Gereksiz Soruları Temizleyin:**
   ```
   - Reels'e gidin
   - Silmek istediğiniz soruları bulun
   - 🗑️ ile silin
   ```

---

## 📚 Daha Fazla Bilgi

- **Detaylı Dokümantasyon:** `JSON_IMPORT_README.md`
- **API Detayları:** `JSON_IMPORT_README.md` → Teknik Detaylar
- **PDF Yükleme:** `PDF_UPLOAD_FIX_SUMMARY.md`
- **Test Rehberi:** `PDF_UPLOAD_FIX_TESTING.md`

---

## ✅ Kontrol Listesi

İlk kullanımdan önce:
- [ ] `example-questions.json` dosyasını incelediniz
- [ ] JSON formatını anladınız
- [ ] Test için örnek dosyayı yüklediniz
- [ ] Soruların Reels'te göründüğünü doğruladınız
- [ ] Bir soruyu silmeyi denediniz
- [ ] Onay dialogunun çalıştığını gördünüz

Hepsi tamam mı? 🎉 Artık kullanmaya hazırsınız!
