# JSON Soru Formatı - Kullanım Kılavuzu

## Genel Bakış

Bu uygulama, soru paketlerini JSON formatında içe aktarmanıza olanak tanır. Her soru paketi, sınav bilgilerini ve soru listesini içerir.

## JSON Formatı

### Ana Yapı

```json
{
  "packageName": "Paket Adı",
  "examType": "TYT veya AYT",
  "year": 2025,
  "description": "Paket açıklaması",
  "questions": [...]
}
```

### Paket Alanları

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `packageName` | string | ✅ Evet | Soru paketinin adı (örn: "TYT 2025 Matematik") |
| `examType` | string | ✅ Evet | Sınav tipi: "TYT" veya "AYT" |
| `year` | number | ❌ Hayır | Sınav yılı (örn: 2025) |
| `description` | string | ❌ Hayır | Paket hakkında kısa açıklama |
| `questions` | array | ✅ Evet | Soru dizisi (en az 1 soru gerekli) |

### Soru Alanları

Her soru nesnesi aşağıdaki alanları içerir:

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `content` | string | ✅ Evet | Soru metni |
| `options` | array | ✅ Evet | Şıklar dizisi (genellikle 5 şık: A-E) |
| `correctAnswer` | string | ✅ Evet | Doğru cevabın harfi ("A", "B", "C", "D" veya "E") |
| `solution` | string | ❌ Hayır | **YENİ!** Sorunun çözüm açıklaması |
| `category` | string | ❌ Hayır | Ders/kategori (örn: "Matematik", "Fizik", "Türkçe") |
| `subject` | string | ❌ Hayır | Alt konu (örn: "Türev", "Paragraf", "Denklemler") |

### Alternatif Alan Adları

Sistem, Türkçe alan adlarını da destekler:

- `soru` → `content`
- `question` → `content`
- `secenekler` / `siklar` → `options`
- `dogruCevap` / `cevap` → `correctAnswer`
- `cozum` / `aciklama` → `solution`
- `ders` / `konu` → `category`
- `altKonu` → `subject`

## Örnek JSON

### Basit Örnek (Çözümsüz)

```json
{
  "packageName": "TYT 2025 Temel Matematik",
  "examType": "TYT",
  "questions": [
    {
      "content": "2 + 2 = ?",
      "options": ["2", "3", "4", "5", "6"],
      "correctAnswer": "C",
      "category": "Matematik"
    }
  ]
}
```

### Gelişmiş Örnek (Çözümlü)

```json
{
  "packageName": "TYT 2025 Matematik - Denklemler",
  "examType": "TYT",
  "year": 2025,
  "description": "TYT Matematik - Birinci Dereceden Denklemler",
  "questions": [
    {
      "content": "3x - 5 = 16 denkleminin çözüm kümesi aşağıdakilerden hangisidir?",
      "options": ["{5}", "{6}", "{7}", "{8}", "{9}"],
      "correctAnswer": "C",
      "solution": "3x - 5 = 16 denkleminde 5'i sağa atarsak: 3x = 16 + 5 → 3x = 21 → x = 21/3 → x = 7 bulunur.",
      "category": "Matematik",
      "subject": "Denklemler"
    }
  ]
}
```

### Türkçe Alan Adlarıyla Örnek

```json
{
  "packageName": "TYT 2025 Fizik",
  "examType": "TYT",
  "questions": [
    {
      "soru": "Işık hızı yaklaşık kaç km/s'dir?",
      "secenekler": [
        "100.000 km/s",
        "200.000 km/s",
        "300.000 km/s",
        "400.000 km/s",
        "500.000 km/s"
      ],
      "dogruCevap": "C",
      "cozum": "Işık hızı vakumda yaklaşık 300.000 km/s (tam olarak 299.792,458 km/s) değerindedir.",
      "ders": "Fizik",
      "altKonu": "Işık"
    }
  ]
}
```

## Çözüm Açıklaması Kullanımı

**YENİ ÖZELLİK:** `solution` (veya `cozum` / `aciklama`) alanı ile soruların çözüm açıklamalarını ekleyebilirsiniz.

### Neden Kullanmalısınız?

- ✅ Öğrencilerin yanlış cevapları anlamalarına yardımcı olur
- ✅ Adım adım çözüm yöntemi gösterir
- ✅ Kavram pekiştirmesine katkı sağlar
- ✅ Konu tekrarı için faydalıdır

### İyi Çözüm Açıklaması Örnekleri

**Matematik:**
```
"3x - 5 = 16 denkleminde 5'i sağa atarsak: 3x = 16 + 5 → 3x = 21 → x = 21/3 → x = 7 bulunur."
```

**Türkçe:**
```
"Doğru yazımı 'hiçbir şey' şeklindedir. 'Hiçbir' sözcüğü bitişik yazılmalıdır."
```

**Fizik:**
```
"F = m × a formülünden, kütle 2 kg ve ivme 5 m/s² ise: F = 2 × 5 = 10 N bulunur."
```

## Soruları İçe Aktarma

1. Uygulamayı açın
2. **PDF Yükle** sekmesine gidin
3. JSON formatında hazırladığınız veriyi yapıştırın
4. **Soruları Ekle** butonuna tıklayın
5. Sorular **Reels** sekmesinde görünecektir

## Sık Karşılaşılan Hatalar

### ❌ Hata: "Geçersiz JSON formatı"
**Çözüm:** JSON'unuzun geçerli olduğundan emin olun. [JSONLint](https://jsonlint.com/) gibi araçlarla kontrol edin.

### ❌ Hata: "packageName, examType ve questions alanları gereklidir"
**Çözüm:** Bu üç alanın JSON'unuzda bulunduğundan emin olun.

### ❌ Hata: "En az bir soru eklemelisiniz"
**Çözüm:** `questions` dizisinin en az bir soru içerdiğinden emin olun.

## İpuçları

- ✅ Şıkları kısa ve net tutun
- ✅ Çözüm açıklamalarında adım adım mantığı gösterin
- ✅ Kategori ve subject alanlarını doldurarak istatistik takibini kolaylaştırın
- ✅ Sınav yılı ekleyerek paketleri organize edin
- ✅ Açıklayıcı paket adları kullanın (örn: "TYT 2025 Matematik - Türev")

## Örnek Dosyalar

Proje klasöründe `sample-questions.json` dosyasını inceleyerek örnek bir paket görebilirsiniz.

## Destek

Sorunlarla karşılaşırsanız:
1. JSON formatınızın yukarıdaki kurallara uygun olduğunu kontrol edin
2. Örnek JSON'ları referans olarak kullanın
3. Her soru için gerekli alanların dolu olduğundan emin olun
