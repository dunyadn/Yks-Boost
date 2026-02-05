# YKS Soru Paketleme Sistemi - Hızlı Başlangıç

## 📋 Genel Bakış

Bu sistem, PDF ve TXT formatındaki YKS sınav sorularını JSON paketlerine dönüştürmek için tasarlanmıştır. Her kaynak dosya ayrı bir paket olarak işlenir ve tüm sorular için detaylı çözümler üretilir.

## 🎯 Temel Kurallar

### ✅ YAPILMASI GEREKENLER

1. **Her dosya ayrı paket**: Her PDF/TXT dosyası kendi JSON paketini oluşturur
2. **Detaylı çözümler**: Her soru için minimum 5-10 cümle açıklama yazılır
3. **Eksiksiz işleme**: Tüm sorular ve tüm alanlar doldurulur
4. **Validasyon**: Her paket otomatik doğrulanır

### ❌ YAPILMAMASI GEREKENLER

1. **Dosyaları birleştirme**: Farklı sınavlar/yıllar aynı pakete girmez
2. **Kısa çözümler**: "Cevap: A" gibi kısa ifadeler yasaktır
3. **Soru atlama**: Tek bir soru bile eksik bırakılamaz
4. **Varsayım yapma**: Tüm bilgiler dosyadan alınır

## 🚀 Hızlı Başlangıç

### 1. Kaynak Dosyaları Hazırlama

Kaynak dosyalarınızı `data/text-files/` dizinine koyun:

```
data/text-files/
  ├── msu-2025.pdf
  ├── tyt-2024-turkce.txt
  └── ayt-matematik-2023.pdf
```

### 2. Toplu Dönüştürme

```bash
# Şablon tabanlı çözümlerle (hızlı)
npm run convert-bulk data/text-files data/questions

# AI destekli detaylı çözümlerle (önerilen)
npm run convert-bulk data/text-files data/questions -- --api-key YOUR_GEMINI_API_KEY
```

### 3. Sonuçları Kontrol Etme

```
data/questions/
  ├── msu-2025.json          ✅
  ├── tyt-2024-turkce.json   ✅
  └── ayt-matematik-2023.json ✅
```

## 📝 Kaynak Dosya Formatı

### TXT Dosya Örneği

```
1. Osmanlı Devleti'nin kuruluş yılı aşağıdakilerden hangisidir?
A) 1071
B) 1299
C) 1453
D) 1520
E) 1923
Cevap: B
Çözüm: Osmanlı Devleti 1299 yılında Osman Bey tarafından kurulmuştur. Bu tarih, Osman Bey'in Söğüt'te beylik kurduğu yıldır...

2. Aşağıdaki hangi eser Yunus Emre'ye aittir?
A) Divan-ı Hikmet
B) Kutadgu Bilig
C) Risaletü'n Nushiyye
D) Hüsn ü Aşk
E) Gülistan
Cevap: C
Çözüm: Risaletü'n Nushiyye, Yunus Emre'nin didaktik bir eseridir...
```

### PDF Dosyaları

PDF dosyaları TXT ile aynı formatı takip etmelidir. Metin katmanı olmayan PDF'ler için OCR uygulanır.

## 📊 Çıktı Formatı

Her paket şu yapıda oluşturulur:

```json
{
  "packageName": "MSÜ 2025",
  "examType": "MSÜ",
  "year": 2025,
  "lesson": "Genel",
  "sourceFile": "msu-2025.pdf",
  "totalQuestions": 120,
  "questions": [
    {
      "id": 1,
      "content": "Soru metni...",
      "options": {
        "A": "Şık A",
        "B": "Şık B",
        "C": "Şık C",
        "D": "Şık D",
        "E": "Şık E"
      },
      "correctAnswer": "C",
      "solution": "Bu soruda öncelikle... (detaylı çözüm)"
    }
  ]
}
```

## 🔍 Validasyon Kontrolleri

Her paket şunları kontrol eder:

- ✅ Soru sayısı doğru (`totalQuestions === questions.length`)
- ✅ Her sorunun içeriği var
- ✅ Her sorunun 5 şıkkı var (A-E)
- ✅ Doğru cevap geçerli (A-E)
- ✅ Çözüm var ve yeterince detaylı (min 50 karakter)
- ✅ ID sırası doğru

## 📈 Örnek Kullanım

### Örnek 1: TYT Tarih Soruları

```bash
# Dosya: data/text-files/sample-tyt-tarih.txt
npm run convert-bulk data/text-files data/questions

# Çıktı: data/questions/sample-tyt-tarih.json
# - packageName: "TYT 2026 Tarih"
# - totalQuestions: 10
# - lesson: "Tarih"
```

### Örnek 2: MSÜ Soruları (PDF)

```bash
# Dosya: data/text-files/msu-2025.pdf
npm run convert-bulk data/text-files data/questions -- --api-key YOUR_KEY

# Çıktı: data/questions/msu-2025.json
# - packageName: "MSÜ 2025"
# - totalQuestions: 120
# - lesson: "Genel"
```

## 🤖 AI Destekli Çözümler

### Gemini API Anahtarı Edinme

1. https://makersuite.google.com/app/apikey adresine gidin
2. API anahtarı oluşturun
3. Anahtarı güvenli bir yerde saklayın

### AI ile Kullanım

```bash
npm run convert-bulk data/text-files data/questions -- --api-key YOUR_GEMINI_API_KEY
```

**Avantajları:**
- Daha detaylı ve eğitici çözümler
- Her şıkkın neden doğru/yanlış olduğu açıklanır
- Adım adım matematiksel işlemler
- Kavram tanımları ve örnekler

## 📚 Desteklenen Sınav Tipleri

- **MSÜ**: Milli Savunma Üniversitesi
- **TYT**: Temel Yeterlilik Testi
- **AYT**: Alan Yeterlilik Testi
- **YKS**: Yükseköğretim Kurumları Sınavı
- **MEBI**: Mebi Yayınları denemeleri

## 📖 Desteklenen Dersler

Matematik, Fizik, Kimya, Biyoloji, Tarih, Coğrafya, Felsefe, Türkçe, Edebiyat, Geometri, İngilizce, Din Kültürü

## 🔧 Sorun Giderme

### "Hiç soru bulunamadı"

**Sebep:** Format uyumsuz
**Çözüm:** 
- Soru numaraları var mı? (1., 2., vb.)
- Şıklar A), B), C), D), E) formatında mı?

### "Validasyon başarısız - Çözüm eksik"

**Sebep:** Her soru için çözüm yok
**Çözüm:**
- Her soru için "Çözüm:" satırı ekleyin
- Çözümler en az 50 karakter olmalı

### "PDF metni çıkarılamadı"

**Sebep:** PDF metin katmanı yok
**Çözüm:**
- OCR uygulanmış PDF kullanın
- Veya TXT formatına çevirin

## 📞 Destek

Sorunlar için:
- Detaylı kılavuz: [COMPREHENSIVE_CONVERTER_GUIDE.md](COMPREHENSIVE_CONVERTER_GUIDE.md)
- GitHub Issues: https://github.com/dunyadn/Yks-Boost/issues

## 📄 İlgili Dokümanlar

- [COMPREHENSIVE_CONVERTER_GUIDE.md](COMPREHENSIVE_CONVERTER_GUIDE.md) - Detaylı teknik kılavuz
- [TEXT_FORMAT_EXAMPLES.md](TEXT_FORMAT_EXAMPLES.md) - Format örnekleri
- [JSON_FORMAT_GUIDE.md](JSON_FORMAT_GUIDE.md) - JSON yapısı

## ✨ Özellikler

- ✅ PDF ve TXT desteği
- ✅ Recursive dizin tarama
- ✅ Otomatik metadata çıkarımı
- ✅ AI destekli çözüm üretimi
- ✅ Kapsamlı validasyon
- ✅ Detaylı hata raporlama
- ✅ Türkçe karakter desteği

## 📊 Başarı Kriterleri

Bir paket başarılı sayılır:
- ✅ Tüm sorular parse edildi
- ✅ Her sorunun 5 şıkkı var
- ✅ Tüm doğru cevaplar var
- ✅ Tüm çözümler detaylı (min 200+ karakter)
- ✅ Validasyon geçti
- ✅ JSON formatı geçerli

---

**Önemli:** Bu sistem EKSİKSİZ veri aktarımı için tasarlanmıştır. Tek bir soru veya çözüm bile eksikse işlem başarısız sayılır.
