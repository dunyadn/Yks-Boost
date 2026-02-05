# Text Dosyası Format Örnekleri

## Desteklenen Text Formatları

Conversion scripti aşağıdaki text formatlarını destekler:

### Format 1: Standart YKS Format (Numaralı)

```text
1. Osmanlı Devleti'nin kuruluş yılı aşağıdakilerden hangisidir?
A) 1071
B) 1299
C) 1453
D) 1520
E) 1923
Cevap: B
Çözüm: Osmanlı Devleti 1299 yılında Osman Bey tarafından kurulmuştur.

2. Aşağıdaki hangi eser Yunus Emre'ye aittir?
A) Divan-ı Hikmet
B) Kutadgu Bilig
C) Risaletü'n Nushiyye
D) Hüsn ü Aşk
E) Gülistan
Cevap: C
Çözüm: Risaletü'n Nushiyye, Yunus Emre'nin didaktik bir eseridir.
Konu: Türk Edebiyatı

3. Işığın kırılma olayı hangi ortamlar arasında gerçekleşir?
A) Aynı yoğunluktaki ortamlar
B) Farklı yoğunluktaki ortamlar
C) Sadece hava ve su arasında
D) Sadece katı ortamlarda
E) Sadece sıvı ortamlarda
Cevap: B
```

### Format 2: "Soru:" Etiketli Format

```text
Soru: 3x - 5 = 16 denkleminin çözüm kümesi aşağıdakilerden hangisidir?
A) {5}
B) {6}
C) {7}
D) {8}
E) {9}
Doğru Cevap: C
Çözüm: 3x - 5 = 16 denkleminde 5'i sağa atarsak: 3x = 16 + 5 → 3x = 21 → x = 21/3 → x = 7 bulunur.
Konu: Denklemler

Soru: Bir dikdörtgenin uzun kenarı kısa kenarının 3 katıdır. Çevresi 96 cm ise, alanı kaç cm²'dir?
A) 432
B) 486
C) 512
D) 576
E) 648
Cevap: A
Çözüm: Kısa kenar = x, uzun kenar = 3x olsun. Çevre = 2(x + 3x) = 8x = 96 → x = 12 cm. Alan = 12 × 36 = 432 cm²
Konu: Geometri
```

### Format 3: Kompakt Format (Tek Satırda Şıklar)

```text
1. Hangisi bir atom altı parçacık değildir?
A) Proton B) Nötron C) Elektron D) Molekül E) Kuark
Cevap: D

2. Fotosentin hangi organelde gerçekleşir?
A) Mitokondri B) Kloroplast C) Ribozom D) Golgi E) Çekirdek
Doğru: B
Açıklama: Fotosentez, bitkisel hücrelerin kloroplast organellerinde gerçekleşen bir olaydır.
```

### Format 4: Çok Satırlı Sorular

```text
1. Aşağıdaki parçada boş bırakılan yere uygun düşen sözcük 
   hangisidir?

   "Bilim insanları, yeni keşfedilen gezegenin _____ oldukça 
   büyük olduğunu tespit ettiler."

A) kütlesinin
B) yörüngesinin
C) çapının
D) uzaklığının
E) sıcaklığının
Cevap: A
Çözüm: Cümlenin anlamına göre "kütlesinin" sözcüğü boşluğa en uygun olanıdır.
```

## Önemli Kurallar

### Zorunlu Alanlar
- Her soru bir numara veya "Soru:" etiketi ile başlamalı
- Her sorunun 5 şıkkı olmalı (A, B, C, D, E)
- Her sorunun cevabı belirtilmeli (Cevap:, Doğru:, Doğru Cevap: formatlarından biri)

### İsteğe Bağlı Alanlar
- **Çözüm/Açıklama**: Sorunun çözüm açıklaması
- **Konu/Subject**: Sorunun konusu/alt başlığı

### Şık Formatları
Aşağıdaki formatlar desteklenir:
- `A) Şık metni` (standart)
- `A. Şık metni` (nokta ile)
- `A: Şık metni` (iki nokta ile)
- Tek satırda: `A) Şık1 B) Şık2 C) Şık3 D) Şık4 E) Şık5`

### Cevap Formatları
- `Cevap: B`
- `Doğru: B`
- `Doğru Cevap: B`
- `CEVAP: B` (büyük harf)

## Örnek Kullanım

### Basit Dönüşüm
```bash
npx tsx scripts/converters/textToJson.ts input.txt output.json \
  --package-name "TYT 2026 Tarih" \
  --exam-type TYT
```

### Detaylı Dönüşüm
```bash
npx tsx scripts/converters/textToJson.ts \
  "Mebi Tarama Testi tyt-tarih.txt" \
  "data/questions/mebi-tyt-tarih-2026.json" \
  --package-name "TYT 2026 Tarih - Mebi Tarama Testi" \
  --exam-type TYT \
  --year 2026 \
  --category Tarih \
  --description "Mebi YKS Tarama Testleri - TYT Tarih"
```

### NPM Script Kullanımı
```bash
npm run convert-questions input.txt output.json -- --package-name "TYT 2026 Matematik"
```

## İpuçları

1. **Türkçe Karakterler**: UTF-8 formatında kaydedilmiş text dosyaları kullanın
2. **Boş Satırlar**: Sorular arasında boş satırlar olabilir, script bunları otomatik temizler
3. **Çok Satırlı Sorular**: Soru metni birden fazla satıra yayılabilir
4. **Esnek Format**: Script farklı formatları algılamaya çalışır, ancak yukarıdaki standartlara uymak en iyi sonucu verir

## Hata Ayıklama

Eğer script soruları doğru parse edemiyorsa:

1. Text dosyasının UTF-8 formatında olduğundan emin olun
2. Her sorunun şıklarının A-E arası olduğunu kontrol edin
3. Cevapların doğru formatta (Cevap: A) olduğunu kontrol edin
4. Örnek formatlara uygun olup olmadığını kontrol edin

## Gelişmiş Özellikler

### Toplu Dönüşüm
Birden fazla dosyayı dönüştürmek için bash script kullanabilirsiniz:

```bash
#!/bin/bash
for file in data/text-files/*.txt; do
  basename=$(basename "$file" .txt)
  npx tsx scripts/converters/textToJson.ts \
    "$file" \
    "data/questions/${basename}.json" \
    --exam-type TYT
done
```
