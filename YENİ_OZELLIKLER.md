# Yeni Özellikler

Bu dokümanda son eklenen yeni özellikler açıklanmaktadır.

## 1. Soru Çözümü (Solution) Alanı

Artık JSON formatında soru eklerken, her soruya bir çözüm ekleyebilirsiniz.

### JSON Formatı

```json
{
  "packageName": "TYT 2025 Matematik",
  "examType": "TYT",
  "year": 2025,
  "description": "TYT Matematik soruları",
  "questions": [
    {
      "soru": "Soru metni buraya",
      "secenekler": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı", "E şıkkı"],
      "dogruCevap": "A",
      "cozum": "Burada sorunun çözümü adım adım açıklanır.",
      "konu": "Matematik",
      "altKonu": "Denklemler"
    }
  ]
}
```

### Desteklenen Alan İsimleri

Çözüm için aşağıdaki alan isimlerinden herhangi birini kullanabilirsiniz:
- `solution` (İngilizce)
- `cozum` (Türkçe)
- `aciklama` (Türkçe)

### Örnek

```json
{
  "packageName": "Örnek Matematik Paketi",
  "examType": "TYT",
  "year": 2025,
  "description": "Denklemler konusu örnek sorular",
  "questions": [
    {
      "soru": "2x + 5 = 15 denkleminin çözümü nedir?",
      "secenekler": ["x = 3", "x = 5", "x = 7", "x = 10", "x = 15"],
      "dogruCevap": "B",
      "cozum": "2x + 5 = 15\n2x = 15 - 5\n2x = 10\nx = 5",
      "konu": "Matematik",
      "altKonu": "Denklemler"
    }
  ]
}
```

## 2. Paket Silme Özelliği

Kütüphane ekranındaki "Paketler" sekmesinde, her paketin yanında bir çöp kutusu ikonu bulunur. Bu ikona tıklayarak:

1. Paketi silebilirsiniz
2. Paketteki tüm sorular da silinir
3. Silme işlemi öncesinde onay istenir

### Kullanım

1. Kütüphane ekranını açın
2. "Paketler" sekmesine geçin
3. Silmek istediğiniz paketin yanındaki çöp kutusu ikonuna tıklayın
4. Açılan onay penceresinde "Sil" butonuna basın

⚠️ **Dikkat:** Bu işlem geri alınamaz. Paket ve içindeki tüm sorular kalıcı olarak silinir.

## 3. Soru Paylaşma Özelliği

YKS Reels ekranında artık soruları paylaşabilirsiniz.

### Kullanım

1. YKS Reels ekranında bir soru görüntüleyin
2. Sağ taraftaki eylem butonları arasında paylaş ikonu (share-2) bulunur
3. İkona tıklayın
4. Paylaşım menüsü açılır
5. Paylaşmak istediğiniz platformu seçin

### Paylaşım Formatı

Soru şu formatta paylaşılır:

```
📚 YKS Boost Sorusu

[Soru Metni]

A) [Seçenek A]
B) [Seçenek B]
C) [Seçenek C]
D) [Seçenek D]
E) [Seçenek E]

#Matematik #YKS #TYT
```

### Özellikler

- Soru metni tam olarak paylaşılır
- Tüm seçenekler dahil edilir
- Kategori ve sınav tipi hashtag olarak eklenir
- Sosyal medyada paylaşım için optimize edilmiştir

## Güncelleme Notları

Bu özellikler uygulamanın aşağıdaki dosyalarında güncellemeler içerir:

### Backend
- `shared/schema.ts` - Questions tablosuna `solution` alanı eklendi
- `server/routes.ts` - Import endpoint çözüm alanını destekler
- `server/storage.ts` - MemStorage çözüm alanını saklar
- `server/fileStorage.ts` - FileStorage çözüm alanını saklar

### Frontend
- `client/screens/LibraryScreen.tsx` - Paket silme butonu ve işlevselliği
- `client/screens/ReelsScreen.tsx` - Soru paylaşma butonu ve işlevselliği
