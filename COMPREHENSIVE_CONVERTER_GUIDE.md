# YKS Soru Dönüştürme Sistemi - Kapsamlı Kılavuz

## Genel Bakış

Bu sistem, PDF ve TXT formatındaki YKS sınav sorularını JSON paketlerine dönüştürür. Her dosya ayrı bir paket olarak işlenir ve tüm sorular için detaylı çözümler üretilir.

## Temel Kurallar

### KRİTİK GEREKSINIMLER

1. **HER DOSYA = AYRI BİR JSON PAKET**
   - Farklı sınavlar veya yıllar asla birleştirilmez
   - Her kaynak dosya kendi JSON paketini oluşturur

2. **DETAYLI ÇÖZÜM ZORUNLULUĞU**
   - Her soru için minimum 5-10 cümle açıklama
   - Adım adım çözüm
   - Her şıkkın neden doğru/yanlış olduğu açıklanır
   - "Cevap: A" gibi kısa ifadeler KESİNLİKLE yasak

3. **EKSİKSİZ İŞLEME**
   - Tek bir soru bile eksik bırakılamaz
   - Tüm alanlar doldurulmalı
   - Validasyon geçmek zorunlu

## JSON Paket Yapısı

```json
{
  "packageName": "MSÜ 2025",
  "examType": "MSÜ",
  "year": 2025,
  "lesson": "Genel",
  "sourceFile": "msu_2025.pdf",
  "totalQuestions": 120,
  "questions": [
    {
      "id": 1,
      "content": "Soru metni burada...",
      "options": {
        "A": "Şık A metni",
        "B": "Şık B metni",
        "C": "Şık C metni",
        "D": "Şık D metni",
        "E": "Şık E metni"
      },
      "correctAnswer": "C",
      "solution": "Detaylı, adım adım çözüm (minimum 200+ karakter)..."
    }
  ]
}
```

## Kullanım

### Toplu Dönüştürme (Önerilen)

Bir dizindeki TÜM PDF ve TXT dosyalarını işler:

```bash
npm run convert-bulk <kaynak-dizin> <hedef-dizin>

# Örnek
npm run convert-bulk ./data/text-files ./data/questions

# AI destekli detaylı çözümlerle
npm run convert-bulk ./data/text-files ./data/questions -- --api-key YOUR_GEMINI_API_KEY
```

### Tekil Dosya Dönüştürme

Tek bir dosyayı işler:

```bash
npm run convert-questions <input.txt> <output.json> -- --package-name "Paket Adı" --exam-type TYT --year 2026 --category Tarih
```

## Desteklenen Dosya Formatları

### TXT Dosya Formatı

#### Format 1: Standart YKS Format
```
1. Osmanlı Devleti'nin kuruluş yılı aşağıdakilerden hangisidir?
A) 1071
B) 1299
C) 1453
D) 1520
E) 1923
Cevap: B
Çözüm: Osmanlı Devleti 1299 yılında Osman Bey tarafından kurulmuştur. Bu tarih...

2. Aşağıdaki hangi eser Yunus Emre'ye aittir?
A) Divan-ı Hikmet
B) Kutadgu Bilig
C) Risaletü'n Nushiyye
D) Hüsn ü Aşk
E) Gülistan
Cevap: C
Çözüm: Risaletü'n Nushiyye, Yunus Emre'nin didaktik bir eseridir...
```

#### Format 2: Kompakt Format
```
Soru: I. Dünya Savaşı hangi yıllar arasında gerçekleşmiştir?
A) 1912-1913 B) 1914-1918 C) 1919-1922 D) 1939-1945 E) 1950-1953
Doğru: B
Çözüm: I. Dünya Savaşı 1914-1918 yılları arasında gerçekleşmiştir...
```

### PDF Dosya Formatı

- Metin katmanı olan PDF'ler: Doğrudan metin çıkarılır
- Taranmış PDF'ler: OCR ile metin çıkarımı yapılır
- Format, TXT formatı ile aynı kuralları izler

## Dosya Adlandırma ve Metadata

Sistem dosya adından otomatik metadata çıkarır:

### Örnekler:
- `msu_2025.pdf` → MSÜ 2025 (Genel)
- `tyt_2024_turkce.txt` → TYT 2024 Türkçe
- `ayt-matematik-2023.pdf` → AYT 2023 Matematik
- `mebi-tarama-tyt-tarih.txt` → TYT 2025 Tarih (MEBI Tarama)

### Desteklenen Sınav Tipleri:
- MSÜ
- TYT
- AYT
- YKS
- MEBI

### Desteklenen Dersler:
- Matematik
- Fizik
- Kimya
- Biyoloji
- Tarih
- Coğrafya
- Felsefe
- Türkçe
- Edebiyat
- Geometri
- İngilizce
- Din

## Çözüm Oluşturma

### Şablon Tabanlı (Varsayılan)

API anahtarı olmadan çalıştırıldığında şablon tabanlı çözümler oluşturur:

```
Bu Tarih sorusunu adım adım inceleyelim:

**Soru Analizi:**
Bu soruda Osmanlı Devleti'nin kuruluş yılı... konusu ele alınmaktadır.

**Şıkların Değerlendirilmesi:**

**A Şıkkı: 1071**
Bu şık YANLIŞTIR. 1071 yılı Malazgirt Savaşı'nın yapıldığı yıldır...

**B Şıkkı: 1299**
Bu şık DOĞRUDUR. Osmanlı Devleti 1299 yılında Osman Bey tarafından kurulmuştur...

[Diğer şıklar...]

**Sonuç:**
Doğru cevap **B şıkkıdır**.

**Not:** Bu tür soruları çözerken...
```

### AI Destekli (Gemini API)

API anahtarı ile çalıştırıldığında Gemini AI ile daha detaylı çözümler:

```bash
npm run convert-bulk ./data/text-files ./data/questions -- --api-key YOUR_GEMINI_API_KEY
```

API anahtarı edinme: https://makersuite.google.com/app/apikey

## Validasyon

Her paket otomatik olarak şu kontrolleri geçer:

1. **Soru Sayısı Kontrolü**
   - `totalQuestions === questions.length`

2. **Her Soru İçin:**
   - ✓ İçerik boş değil
   - ✓ 5 şık mevcut (A, B, C, D, E)
   - ✓ Doğru cevap geçerli (A-E arası)
   - ✓ Çözüm var ve en az 50 karakter
   - ✓ ID sırası doğru

3. **Hata Raporlama**
   - Tüm validasyon hataları raporlanır
   - Hata varsa işlem başarısız sayılır

## Çıktı Yapısı

```
data/questions/
  ├── sample-tyt-fizik.json          (6 soru)
  ├── sample-tyt-matematik.json      (8 soru)
  ├── sample-tyt-tarih.json          (10 soru)
  └── mebi-tarama-tyt-tarih.json     (12 soru)
```

## İşlem Özeti

Başarılı tamamlama sonrası:

```
============================================================
📊 İŞLEM ÖZETİ
============================================================
✅ Başarılı: 3
❌ Başarısız: 0
📦 Toplam: 3

🎉 Tüm dosyalar başarıyla işlendi!
```

## Hata Ayıklama

### Yaygın Hatalar ve Çözümler

1. **"Hiç soru bulunamadı"**
   - Dosya formatını kontrol edin
   - Soru numaralandırması var mı? (1., 2., vb.)
   - Şıklar A), B), C), D), E) formatında mı?

2. **"Validasyon başarısız - Çözüm eksik"**
   - Her soru için "Çözüm:" satırı var mı?
   - Çözüm yeterince detaylı mı? (min 50 karakter)

3. **"PDF metni çıkarılamadı"**
   - PDF metin katmanı içeriyor mu?
   - Dosya bozuk değil mi?

4. **"Soru sayısı uyumsuz"**
   - Bazı sorular eksik parse edilmiş olabilir
   - Format kontrolü yapın

## Gelişmiş Kullanım

### Alt Dizinleri Tarama

```bash
# Tüm alt dizinlerdeki dosyalar işlenir
npm run convert-bulk ./source-root ./output
```

### ZIP Dosyaları

ZIP dosyaları otomatik olarak atlanır (açılmaz).

### Paralel İşleme

Şu anda sıralı işleme yapılır. Gelecekte paralel işleme eklenebilir.

## API Entegrasyonu

### Gemini API Kullanımı

```typescript
import { generateDetailedSolution } from './scripts/converters/aiSolutionGenerator';

const solution = await generateDetailedSolution(
  {
    content: "Soru metni...",
    options: ["A", "B", "C", "D", "E"],
    correctAnswer: "C",
  },
  "Matematik",
  "YOUR_API_KEY"
);
```

## Güvenlik

- API anahtarları kod içinde saklanmaz
- Ortam değişkenleri kullanılabilir: `GEMINI_API_KEY`
- API anahtarları commit edilmemelidir

## Performans

- TXT dosyası: ~1-2 saniye/dosya
- PDF dosyası: ~3-5 saniye/dosya
- AI çözüm (her soru için): ~1-2 saniye
- Rate limiting: Soru başına 1 saniye bekleme

## Sınırlamalar

- Maksimum dosya boyutu: Yok (pratik olarak ~100MB)
- Görsel sorular: Metin olarak işlenir, görsel referansı korunur
- Karmaşık matematiksel formüller: Unicode olarak işlenir

## Katkıda Bulunma

Yeni özellikler:
- [ ] OCR iyileştirmeleri
- [ ] Görsel tanıma
- [ ] Batch API çağrıları
- [ ] Önbellek sistemi
- [ ] İlerleme çubuğu

## Destek

Sorun bildirimlerini GitHub Issues üzerinden yapabilirsiniz.

## Lisans

Bu proje özel bir proje olup, tüm hakları saklıdır.
