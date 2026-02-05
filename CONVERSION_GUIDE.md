# YKS Soru Dönüştürme Kılavuzu

## 📖 Genel Bakış

Bu kılavuz, text dosyalarındaki YKS sorularını JSON formatına dönüştürmek için kullanılan araçları ve süreçleri açıklar.

## 🚀 Hızlı Başlangıç

### Temel Kullanım

```bash
npm run convert-questions <input-file> <output-file> -- --package-name "Paket Adı" --exam-type TYT
```

### Örnek

```bash
npm run convert-questions \
  data/text-files/sample-tyt-tarih.txt \
  data/questions/sample-tyt-tarih-2026.json \
  -- --package-name "TYT 2026 Tarih - Örnek Sorular" \
  --exam-type TYT \
  --year 2026 \
  --category Tarih \
  --description "TYT Tarih örnek soruları"
```

## 📋 Komut Satırı Seçenekleri

| Seçenek | Açıklama | Zorunlu | Örnek |
|---------|----------|---------|-------|
| `<input-file>` | Dönüştürülecek text dosyası | ✅ Evet | `data/text-files/sorular.txt` |
| `<output-file>` | Oluşturulacak JSON dosyası | ✅ Evet | `data/questions/sorular.json` |
| `--package-name` | Soru paketi adı | ✅ Evet | `"TYT 2026 Matematik"` |
| `--exam-type` | Sınav tipi (TYT/AYT) | ✅ Evet | `TYT` |
| `--year` | Sınav yılı | ❌ Hayır | `2026` |
| `--category` | Ders/Kategori | ❌ Hayır | `Matematik` |
| `--description` | Paket açıklaması | ❌ Hayır | `"TYT Matematik temel sorular"` |

## 📝 Desteklenen Text Formatları

Script birden fazla text formatını destekler. Detaylar için [TEXT_FORMAT_EXAMPLES.md](TEXT_FORMAT_EXAMPLES.md) dosyasına bakın.

### Format 1: Standart YKS Format

```text
1. Soru metni burada...
A) Şık 1
B) Şık 2
C) Şık 3
D) Şık 4
E) Şık 5
Cevap: B
Çözüm: Çözüm açıklaması...
```

### Format 2: "Soru:" Etiketli

```text
Soru: Soru metni...
A) Şık 1
B) Şık 2
C) Şık 3
D) Şık 4
E) Şık 5
Doğru Cevap: C
Çözüm: Açıklama...
Konu: Alt konu başlığı
```

### Format 3: Kompakt Format

```text
1. Soru metni?
A) Şık1 B) Şık2 C) Şık3 D) Şık4 E) Şık5
Cevap: D
```

## 🎯 Çıktı Formatı

Script aşağıdaki JSON formatını üretir:

```json
{
  "packageName": "TYT 2026 Tarih",
  "examType": "TYT",
  "year": 2026,
  "description": "Açıklama",
  "questions": [
    {
      "content": "Soru metni",
      "options": ["Şık 1", "Şık 2", "Şık 3", "Şık 4", "Şık 5"],
      "correctAnswer": "B",
      "solution": "Çözüm açıklaması",
      "category": "Tarih",
      "subject": "Alt konu"
    }
  ]
}
```

## 📂 Dosya Organizasyonu

### Önerilen Dizin Yapısı

```
Yks-Boost/
├── data/
│   ├── text-files/          # Kaynak text dosyaları
│   │   ├── sample-tyt-tarih.txt
│   │   ├── mebi-tyt-tarih.txt
│   │   └── ...
│   └── questions/           # Dönüştürülmüş JSON dosyaları
│       ├── sample-tyt-tarih-2026.json
│       ├── mebi-tyt-tarih-2026.json
│       └── ...
```

### Dosya İsimlendirme Önerileri

- **Text dosyaları**: `{kaynak}-{sinav}-{ders}.txt`
  - Örnek: `mebi-tyt-tarih.txt`, `3d-tyt-matematik.txt`

- **JSON dosyaları**: `{kaynak}-{sinav}-{ders}-{yil}.json`
  - Örnek: `mebi-tyt-tarih-2026.json`, `3d-tyt-matematik-2024.json`

## 🔄 Toplu Dönüştürme

Birden fazla dosyayı dönüştürmek için:

### Bash Script Kullanımı

```bash
#!/bin/bash
# convert-all.sh

for file in data/text-files/*.txt; do
  basename=$(basename "$file" .txt)
  npm run convert-questions \
    "$file" \
    "data/questions/${basename}-2026.json" \
    -- --package-name "TYT 2026 ${basename}" \
    --exam-type TYT \
    --year 2026
done
```

Çalıştırma:
```bash
chmod +x convert-all.sh
./convert-all.sh
```

## ✅ Kalite Kontrolü

### Dönüşüm Sonrası Kontroller

1. **Soru Sayısı**: Tüm sorular dönüştürüldü mü?
2. **Türkçe Karakterler**: ç, ğ, ı, ö, ş, ü karakterleri korundu mu?
3. **Şıklar**: Her soruda 5 şık var mı?
4. **Cevaplar**: Her sorunun cevabı belirtilmiş mi?
5. **Çözümler**: Çözüm açıklamaları doğru aktarıldı mı?

### Validasyon

Oluşturulan JSON dosyasını kontrol etmek için:

```bash
# JSON formatı geçerliliği
cat data/questions/dosya.json | jq .

# Soru sayısını kontrol et
cat data/questions/dosya.json | jq '.questions | length'

# Eksik cevaplı soruları bul
cat data/questions/dosya.json | jq '.questions[] | select(.correctAnswer == null)'
```

## 🐛 Sorun Giderme

### Sık Karşılaşılan Sorunlar

#### 1. "Dosya bulunamadı" Hatası

**Çözüm**: Dosya yolunun doğru olduğundan emin olun.

```bash
# Mutlak yol kullanın
npm run convert-questions "$(pwd)/data/text-files/dosya.txt" ...
```

#### 2. Türkçe Karakterler Bozuk

**Çözüm**: Text dosyasının UTF-8 formatında olduğundan emin olun.

```bash
# Dosya encoding'ini kontrol et
file -i data/text-files/dosya.txt

# UTF-8'e dönüştür
iconv -f ISO-8859-9 -t UTF-8 dosya.txt > dosya-utf8.txt
```

#### 3. Sorular Eksik Parse Ediliyor

**Çözüm**: 
- Text formatının desteklenen formatlara uygun olduğunu kontrol edin
- Her sorunun numarası veya "Soru:" etiketi olmalı
- Şıklar A-E arası olmalı
- Cevap formatı "Cevap: X" veya "Doğru: X" şeklinde olmalı

#### 4. Şıklar Birleşiyor

**Çözüm**: Şıklar arasında boşluk olmalı veya her şık ayrı satırda olmalı.

```text
# ✅ Doğru
A) Şık 1 B) Şık 2 C) Şık 3 D) Şık 4 E) Şık 5

# ✅ Doğru
A) Şık 1
B) Şık 2
C) Şık 3
D) Şık 4
E) Şık 5

# ❌ Yanlış
A)Şık1B)Şık2C)Şık3D)Şık4E)Şık5
```

## 📊 İstatistikler ve Raporlama

Script dönüşüm sırasında şu bilgileri gösterir:

- Toplam soru sayısı
- Çözümlü soru sayısı
- Paket bilgileri (ad, tür, yıl)
- Eksik bilgi içeren sorular

Örnek çıktı:

```
📖 Text dosyası okunuyor: data/text-files/sample-tyt-tarih.txt
🔄 Sorular parse ediliyor...
✅ 10 soru başarıyla parse edildi
💾 JSON dosyası oluşturuldu: data/questions/sample-tyt-tarih-2026.json

📊 Özet:
   Paket Adı: TYT 2026 Tarih - Örnek Sorular
   Sınav Tipi: TYT
   Yıl: 2026
   Toplam Soru: 10
   Çözümlü Soru: 10
```

## 🔍 İleri Düzey Kullanım

### Script'i Kod İçinde Kullanma

```typescript
import { parseTextFile, QuestionPackage } from './scripts/converters/textToJson';
import * as fs from 'fs';

const content = fs.readFileSync('input.txt', 'utf-8');
const packageData: QuestionPackage = parseTextFile(content, {
  packageName: 'TYT 2026 Matematik',
  examType: 'TYT',
  year: 2026,
  category: 'Matematik'
});

console.log(`Parsed ${packageData.questions.length} questions`);
```

### Özel Parser Yazma

Eğer farklı bir text formatı kullanıyorsanız, `textToJson.ts` dosyasındaki `parseTextFile` fonksiyonunu özelleştirebilirsiniz.

## 📚 Ek Kaynaklar

- [TEXT_FORMAT_EXAMPLES.md](TEXT_FORMAT_EXAMPLES.md) - Text format örnekleri
- [JSON_FORMAT_GUIDE.md](JSON_FORMAT_GUIDE.md) - JSON format kılavuzu
- [sample-questions.json](sample-questions.json) - Örnek JSON dosyası

## 💡 İpuçları

1. **Türkçe Karakterler**: Her zaman UTF-8 encoding kullanın
2. **Dosya Boyutu**: Büyük dosyalar için toplu dönüşüm scriptleri kullanın
3. **Yedekleme**: Orijinal text dosyalarını saklayın
4. **Versiyon Kontrolü**: JSON dosyalarını git'e commitleyin
5. **Validasyon**: Dönüşümden sonra mutlaka JSON'ı kontrol edin

## 🤝 Katkıda Bulunma

Text formatı desteği eklemek veya parser iyileştirmesi yapmak için:

1. `scripts/converters/textToJson.ts` dosyasını inceleyin
2. Yeni format desteği ekleyin
3. Test dosyası oluşturun
4. Pull request açın

## 📞 Destek

Sorun yaşarsanız:
1. [TEXT_FORMAT_EXAMPLES.md](TEXT_FORMAT_EXAMPLES.md) dosyasını inceleyin
2. Örnek dosyaları referans alın
3. Issue açın veya pull request gönderin
