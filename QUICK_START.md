# YKS Soru Dönüştürme - Hızlı Başlangıç

## 🚀 Tek Komutla Dönüştürme

```bash
npm run convert-questions <input.txt> <output.json> -- --package-name "Paket Adı" --exam-type TYT
```

## 📋 Örnek Kullanımlar

### Basit Dönüşüm
```bash
npm run convert-questions \
  data/text-files/sorular.txt \
  data/questions/sorular.json \
  -- --package-name "TYT 2026 Tarih" \
  --exam-type TYT
```

### Tam Parametreli Dönüşüm
```bash
npm run convert-questions \
  data/text-files/mebi-tyt-tarih.txt \
  data/questions/mebi-tyt-tarih-2026.json \
  -- --package-name "TYT 2026 Tarih - Mebi Tarama Testi" \
  --exam-type TYT \
  --year 2026 \
  --category Tarih \
  --description "Mebi YKS Tarama Testleri - TYT Tarih"
```

## 📝 Desteklenen Text Formatları

### Format 1: Numaralı Sorular
```text
1. Soru metni?
A) Şık 1
B) Şık 2
C) Şık 3
D) Şık 4
E) Şık 5
Cevap: B
Çözüm: Açıklama...
```

### Format 2: Etiketli Sorular
```text
Soru: Soru metni?
A) Şık 1
B) Şık 2
C) Şık 3
D) Şık 4
E) Şık 5
Doğru Cevap: C
Çözüm: Açıklama...
Konu: Alt başlık
```

### Format 3: Kompakt
```text
1. Soru?
A) Şık1 B) Şık2 C) Şık3 D) Şık4 E) Şık5
Cevap: D
```

## 🎯 Gerekli Parametreler

| Parametre | Açıklama | Örnek |
|-----------|----------|-------|
| `<input-file>` | Text dosyası yolu | `data/text-files/sorular.txt` |
| `<output-file>` | JSON dosyası yolu | `data/questions/sorular.json` |
| `--package-name` | Paket adı | `"TYT 2026 Matematik"` |
| `--exam-type` | Sınav tipi | `TYT` veya `AYT` |

## 📊 Opsiyonel Parametreler

| Parametre | Açıklama | Örnek |
|-----------|----------|-------|
| `--year` | Yıl | `2026` |
| `--category` | Ders/Kategori | `Matematik` |
| `--description` | Açıklama | `"Detaylı açıklama"` |

## ✅ Kontrol Listesi

Dönüşümden önce:
- [ ] Text dosyası UTF-8 formatında mı?
- [ ] Her sorunun numarası veya "Soru:" etiketi var mı?
- [ ] Her sorunun 5 şıkkı (A-E) var mı?
- [ ] Her sorunun cevabı belirtilmiş mi?

Dönüşümden sonra:
- [ ] Tüm sorular dönüştürüldü mü?
- [ ] Türkçe karakterler korundu mu?
- [ ] JSON formatı geçerli mi?

## 📚 Detaylı Dokümantasyon

- [CONVERSION_GUIDE.md](CONVERSION_GUIDE.md) - Tam kullanım kılavuzu
- [TEXT_FORMAT_EXAMPLES.md](TEXT_FORMAT_EXAMPLES.md) - Format örnekleri
- [data/README.md](data/README.md) - Veri dizini yapısı

## 🐛 Sık Sorunlar

**Türkçe karakterler bozuk:**
```bash
# Dosyayı UTF-8'e çevir
iconv -f ISO-8859-9 -t UTF-8 input.txt > input-utf8.txt
```

**Sorular eksik parse ediliyor:**
- Format örneklerine uygun mu kontrol edin
- Her sorunun başında numara veya "Soru:" olmalı
- Şıklar A-E arası olmalı

## 💡 İpuçları

1. **Örnek Dosyalar**: `data/text-files/` dizinindeki örneklere bakın
2. **Toplu Dönüşüm**: Birden fazla dosya için bash script kullanın
3. **Yedekleme**: Orijinal text dosyalarını saklayın
4. **Test**: İlk dönüşümden sonra JSON'ı kontrol edin

## 📞 Yardım

Sorun yaşıyorsanız detaylı dokümantasyona bakın veya issue açın.
