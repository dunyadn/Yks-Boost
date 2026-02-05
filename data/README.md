# Soru Paketleri Veri Dizini

Bu dizin YKS soru paketlerini içerir.

## 📂 Dizin Yapısı

```
data/
├── text-files/          # Kaynak text dosyaları
│   ├── sample-tyt-tarih.txt
│   ├── sample-tyt-matematik.txt
│   ├── sample-tyt-fizik.txt
│   └── ...
└── questions/           # Dönüştürülmüş JSON dosyaları
    ├── sample-tyt-tarih-2026.json
    ├── sample-tyt-matematik-2026.json
    ├── sample-tyt-fizik-2026.json
    └── ...
```

## 📝 Text Dosyaları (`text-files/`)

Text dosyaları, YKS sorularını içeren kaynak dosyalardır. Bu dosyalar JSON formatına dönüştürülmek üzere hazırlanmıştır.

### Desteklenen Formatlar

Detaylı format bilgileri için [TEXT_FORMAT_EXAMPLES.md](../TEXT_FORMAT_EXAMPLES.md) dosyasına bakın.

### Örnek Dosyalar

- **sample-tyt-tarih.txt**: 10 TYT Tarih sorusu
- **sample-tyt-matematik.txt**: 8 TYT Matematik sorusu
- **sample-tyt-fizik.txt**: 6 TYT Fizik sorusu

## 📊 JSON Dosyaları (`questions/`)

JSON dosyaları, uygulamada kullanılmak üzere text dosyalarından dönüştürülmüş soru paketleridir.

### Dosya Formatı

Her JSON dosyası şu yapıya sahiptir:

```json
{
  "packageName": "TYT 2026 Matematik - Örnek Sorular",
  "examType": "TYT",
  "year": 2026,
  "description": "Paket açıklaması",
  "questions": [
    {
      "content": "Soru metni",
      "options": ["Şık 1", "Şık 2", "Şık 3", "Şık 4", "Şık 5"],
      "correctAnswer": "C",
      "solution": "Çözüm açıklaması",
      "category": "Matematik",
      "subject": "Alt konu"
    }
  ]
}
```

### Örnek JSON Dosyaları

| Dosya | Sınav | Ders | Soru Sayısı |
|-------|-------|------|-------------|
| sample-tyt-tarih-2026.json | TYT | Tarih | 10 |
| sample-tyt-matematik-2026.json | TYT | Matematik | 8 |
| sample-tyt-fizik-2026.json | TYT | Fizik | 6 |

## 🔄 Text'ten JSON'a Dönüştürme

Text dosyalarını JSON formatına dönüştürmek için:

```bash
npm run convert-questions \
  data/text-files/<dosya>.txt \
  data/questions/<dosya>.json \
  -- --package-name "Paket Adı" \
  --exam-type TYT \
  --year 2026 \
  --category "Ders Adı"
```

### Örnek

```bash
npm run convert-questions \
  data/text-files/sample-tyt-matematik.txt \
  data/questions/sample-tyt-matematik-2026.json \
  -- --package-name "TYT 2026 Matematik - Örnek Sorular" \
  --exam-type TYT \
  --year 2026 \
  --category Matematik
```

Detaylı kullanım için [CONVERSION_GUIDE.md](../CONVERSION_GUIDE.md) dosyasına bakın.

## 📥 Uygulamaya Yükleme

JSON dosyalarını uygulamaya yüklemek için:

1. Uygulamayı açın
2. "PDF Upload" sekmesine gidin
3. JSON dosyasının içeriğini kopyalayıp yapıştırın
4. "Soruları Ekle" butonuna tıklayın

Alternatif olarak, JSON dosyalarını doğrudan uygulamanın veri kaynağı olarak kullanabilirsiniz.

## 🎯 Dosya İsimlendirme Kuralları

### Text Dosyaları
- Format: `{kaynak}-{sinav}-{ders}.txt`
- Örnek: `mebi-tyt-tarih.txt`, `3d-tyt-matematik.txt`

### JSON Dosyaları
- Format: `{kaynak}-{sinav}-{ders}-{yil}.json`
- Örnek: `mebi-tyt-tarih-2026.json`, `3d-tyt-matematik-2024.json`

## ✅ Kalite Kontrol

Dönüşüm sonrası kontrol edilmesi gerekenler:

- [ ] Tüm sorular dönüştürüldü mü?
- [ ] Türkçe karakterler korundu mu?
- [ ] Her sorunun 5 şıkkı var mı?
- [ ] Cevaplar doğru mu?
- [ ] Çözümler eksiksiz mi?
- [ ] JSON formatı geçerli mi?

## 📚 Kaynaklar

- [CONVERSION_GUIDE.md](../CONVERSION_GUIDE.md) - Dönüştürme kılavuzu
- [TEXT_FORMAT_EXAMPLES.md](../TEXT_FORMAT_EXAMPLES.md) - Text format örnekleri
- [JSON_FORMAT_GUIDE.md](../JSON_FORMAT_GUIDE.md) - JSON format kılavuzu
